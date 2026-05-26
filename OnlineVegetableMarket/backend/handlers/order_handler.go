package handlers

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"

	"vegetable-market/config"
	"vegetable-market/models"
)

type OrderHandler struct{}

func NewOrderHandler() *OrderHandler {
	return &OrderHandler{}
}

func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint64)

	var req models.OrderCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var cartItems []models.CartItem
	if err := config.Cfg.DB.Preload("Product").
		Where("user_id = ? AND id IN ? AND selected = ?", userID, req.CartItemIDs, true).
		Find(&cartItems).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch cart items"})
	}

	if len(cartItems) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No selected items in cart"})
	}

	var slot models.DeliverySlot
	if err := config.Cfg.DB.First(&slot, req.DeliverySlotID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Delivery slot not found"})
	}
	if slot.Status == "full" || slot.CurrentOrders >= slot.MaxOrders {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Delivery slot is full"})
	}

	ctx := context.Background()
	today := time.Now().Format("2006-01-02")

	var totalAmount float64
	var orderItems []models.OrderItem

	for _, ci := range cartItems {
		if ci.Product == nil {
			continue
		}

		cacheKey := fmt.Sprintf("inventory:%d:%s", ci.ProductID, today)
		stockStr, err := config.Cfg.Redis.Get(ctx, cacheKey).Result()
		var remainingStock float64
		if err == redis.Nil {
			var inv models.DailyInventory
			if err := config.Cfg.DB.Where("product_id = ? AND inventory_date = ?", ci.ProductID, today).First(&inv).Error; err == nil {
				remainingStock = inv.RemainingQuantity
				config.Cfg.Redis.Set(ctx, cacheKey, remainingStock, 24*time.Hour)
			}
		} else if err == nil {
			remainingStock, _ = strconv.ParseFloat(stockStr, 64)
		}

		if remainingStock < ci.Quantity {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fmt.Sprintf("Insufficient stock for %s", ci.Product.Name),
			})
		}

		subtotal := ci.Product.Price * ci.Quantity
		totalAmount += subtotal

		orderItems = append(orderItems, models.OrderItem{
			ProductID:    ci.ProductID,
			ProductName:  ci.Product.Name,
			ProductImage: ci.Product.ImageURL,
			PriceUnit:    ci.Product.PriceUnit,
			UnitPrice:    ci.Product.Price,
			Quantity:     ci.Quantity,
			Subtotal:     subtotal,
		})
	}

	deliveryFee := 0.0
	if totalAmount < 30 {
		deliveryFee = 5.0
	}

	orderNo := fmt.Sprintf("VM%s%s",
		time.Now().Format("20060102150405"),
		fmt.Sprintf("%06d", userID))

	order := models.Order{
		OrderNo:         orderNo,
		UserID:          userID,
		TotalAmount:     totalAmount,
		DeliveryFee:     deliveryFee,
		PayableAmount:   totalAmount + deliveryFee,
		DeliveryAddress: req.DeliveryAddress,
		DeliverySlotID:  req.DeliverySlotID,
		ContactName:     req.ContactName,
		ContactPhone:    req.ContactPhone,
		Remark:          req.Remark,
		Status:          "pending",
		PaymentStatus:   "unpaid",
		DeliveryStatus:  "pending",
	}

	err := config.Cfg.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&order).Error; err != nil {
			return err
		}

		for i := range orderItems {
			orderItems[i].OrderID = order.ID
			if err := tx.Create(&orderItems[i]).Error; err != nil {
				return err
			}
		}

		slot.CurrentOrders++
		if slot.CurrentOrders >= slot.MaxOrders {
			slot.Status = "full"
		}
		if err := tx.Save(&slot).Error; err != nil {
			return err
		}

		slotKey := fmt.Sprintf("slot:%d", slot.ID)
		config.Cfg.Redis.Incr(ctx, slotKey)
		config.Cfg.Redis.Expire(ctx, slotKey, 24*time.Hour)

		for _, ci := range cartItems {
			cacheKey := fmt.Sprintf("inventory:%d:%s", ci.ProductID, today)
			config.Cfg.Redis.DecrBy(ctx, cacheKey, int64(ci.Quantity*100))
			config.Cfg.Redis.Expire(ctx, cacheKey, 24*time.Hour)

			if err := tx.Model(&models.DailyInventory{}).
				Where("product_id = ? AND inventory_date = ?", ci.ProductID, today).
				UpdateColumn("remaining_quantity", gorm.Expr("remaining_quantity - ?", ci.Quantity)).Error; err != nil {
				return err
			}
		}

		if err := tx.Where("user_id = ? AND id IN ?", userID, req.CartItemIDs).Delete(&models.CartItem{}).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create order"})
	}

	return c.JSON(fiber.Map{
		"order_id":    order.ID,
		"order_no":    order.OrderNo,
		"total_amount": order.TotalAmount,
		"payable_amount": order.PayableAmount,
		"delivery_fee": order.DeliveryFee,
	})
}

func (h *OrderHandler) GetOrders(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint64)
	userRole := c.Locals("user_role").(string)

	var query models.OrderListQuery
	c.QueryParser(&query)

	if query.Page <= 0 {
		query.Page = 1
	}
	if query.PageSize <= 0 {
		query.PageSize = 10
	}

	db := config.Cfg.DB.Model(&models.Order{})
	if userRole == "customer" {
		db = db.Where("user_id = ?", userID)
	}
	if query.Status != "" {
		db = db.Where("status = ?", query.Status)
	}

	var total int64
	db.Count(&total)

	var orders []models.Order
	offset := (query.Page - 1) * query.PageSize
	if err := db.Preload("Items").Preload("DeliverySlot").
		Order("created_at DESC").
		Offset(offset).Limit(query.PageSize).
		Find(&orders).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch orders"})
	}

	return c.JSON(fiber.Map{
		"orders":    orders,
		"total":     total,
		"page":      query.Page,
		"pageSize":  query.PageSize,
	})
}

func (h *OrderHandler) GetOrder(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint64)
	userRole := c.Locals("user_role").(string)

	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	var order models.Order
	db := config.Cfg.DB.Preload("Items").Preload("DeliverySlot")
	if userRole == "customer" {
		db = db.Where("user_id = ?", userID)
	}
	if err := db.First(&order, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
	}

	var records []models.DeliveryRecord
	config.Cfg.DB.Where("order_id = ?", id).Order("created_at ASC").Find(&records)

	return c.JSON(fiber.Map{
		"order":            order,
		"delivery_records": records,
	})
}

func (h *OrderHandler) UpdateOrderStatus(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	var req models.OrderStatusUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var order models.Order
	if err := config.Cfg.DB.First(&order, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
	}

	now := time.Now()
	updates := map[string]interface{}{
		"status": req.Status,
	}

	switch req.Status {
	case "paid":
		updates["payment_status"] = "paid"
		updates["paid_at"] = now
	case "preparing":
		updates["delivery_status"] = "pending"
	case "delivering":
		updates["delivery_status"] = "delivering"
	case "completed":
		updates["delivery_status"] = "delivered"
		updates["delivered_at"] = now
	case "cancelled":
		updates["payment_status"] = "refunded"
	case "refunded":
		updates["payment_status"] = "refunded"
	}

	if err := config.Cfg.DB.Model(&order).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update order"})
	}

	config.Cfg.DB.First(&order, id)
	return c.JSON(fiber.Map{"order": order})
}

func (h *OrderHandler) AddDeliveryRecord(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	var req models.DeliveryActionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	record := models.DeliveryRecord{
		OrderID:     id,
		Action:      req.Action,
		Description: req.Description,
		Operator:    c.Locals("username").(string),
	}

	if err := config.Cfg.DB.Create(&record).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create delivery record"})
	}

	return c.JSON(fiber.Map{"record": record})
}
