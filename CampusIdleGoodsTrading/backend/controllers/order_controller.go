package controllers

import (
	"campus-trading/config"
	"campus-trading/models"
	"campus-trading/utils"
	"encoding/json"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	OrderStatusPending   = 0
	OrderStatusPaid      = 1
	OrderStatusShipped   = 2
	OrderStatusCompleted = 3
	OrderStatusRefunded  = 4
	OrderStatusCancelled = 5
)

type CreateOrderRequest struct {
	AddressID uint   `json:"address_id" binding:"required"`
	CartIDs   []uint `json:"cart_ids"`
	Items     []struct {
		ProductID uint `json:"product_id"`
		Quantity  int  `json:"quantity"`
	} `json:"items"`
	Remark string `json:"remark"`
}

func CreateOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var address models.Address
	if result := config.DB.Where("id = ? AND user_id = ?", req.AddressID, userID).First(&address); result.Error != nil {
		utils.NotFound(c, "收货地址不存在")
		return
	}

	var orderItems []models.OrderItem
	var totalPrice float64

	if len(req.CartIDs) > 0 {
		var carts []models.Cart
		config.DB.Where("id IN ? AND user_id = ?", req.CartIDs, userID).Preload("Product").Find(&carts)

		for _, cart := range carts {
			if cart.Product.Status != 1 {
				utils.BadRequest(c, "商品"+cart.Product.Name+"已下架")
				return
			}
			if cart.Product.Stock < cart.Quantity {
				utils.BadRequest(c, "商品"+cart.Product.Name+"库存不足")
				return
			}

			subtotal := float64(cart.Quantity) * cart.Product.Price
			orderItems = append(orderItems, models.OrderItem{
				ProductID:   cart.ProductID,
				ProductName: cart.Product.Name,
				ProductImage: cart.Product.Image,
				Price:       cart.Product.Price,
				Quantity:    cart.Quantity,
				Subtotal:    subtotal,
			})
			totalPrice += subtotal
		}

		config.DB.Where("id IN ?", req.CartIDs).Delete(&models.Cart{})
	} else if len(req.Items) > 0 {
		for _, item := range req.Items {
			var product models.Product
			if result := config.DB.First(&product, item.ProductID); result.Error != nil {
				utils.NotFound(c, "商品不存在")
				return
			}
			if product.Status != 1 {
				utils.BadRequest(c, "商品"+product.Name+"已下架")
				return
			}
			if product.Stock < item.Quantity {
				utils.BadRequest(c, "商品"+product.Name+"库存不足")
				return
			}

			subtotal := float64(item.Quantity) * product.Price
			orderItems = append(orderItems, models.OrderItem{
				ProductID:    item.ProductID,
				ProductName:  product.Name,
				ProductImage: product.Image,
				Price:        product.Price,
				Quantity:     item.Quantity,
				Subtotal:     subtotal,
			})
			totalPrice += subtotal
		}
	} else {
		utils.BadRequest(c, "请选择商品")
		return
	}

	addressJSON, _ := json.Marshal(address)

	order := models.Order{
		OrderNo:     utils.GenerateOrderNo(),
		UserID:      userID.(uint),
		TotalPrice:  totalPrice,
		Status:      OrderStatusPending,
		AddressInfo: string(addressJSON),
		Remark:      req.Remark,
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		if result := tx.Create(&order); result.Error != nil {
			return result.Error
		}

		for i := range orderItems {
			orderItems[i].OrderID = order.ID
		}

		if result := tx.Create(&orderItems); result.Error != nil {
			return result.Error
		}

		for _, item := range orderItems {
			if result := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
				UpdateColumn("stock", gorm.Expr("stock - ?", item.Quantity)); result.Error != nil {
				return result.Error
			}
		}

		return nil
	})

	if err != nil {
		utils.ServerError(c, "创建订单失败")
		return
	}

	utils.Success(c, gin.H{
		"order_id":  order.ID,
		"order_no":  order.OrderNo,
		"total_price": totalPrice,
	})
}

func GetOrders(c *gin.Context) {
	userID, _ := c.Get("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	query := config.DB.Model(&models.Order{}).Where("user_id = ?", userID).Preload("Items")

	if status != "" {
		statusInt, _ := strconv.Atoi(status)
		query = query.Where("status = ?", statusInt)
	}

	var total int64
	query.Count(&total)

	var orders []models.Order
	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&orders)

	utils.Success(c, utils.PageResult{
		List:     orders,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

func GetOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")

	var order models.Order
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).Preload("Items").First(&order); result.Error != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	utils.Success(c, order)
}

func PayOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")

	var order models.Order
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&order); result.Error != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.Status != OrderStatusPending {
		utils.BadRequest(c, "订单状态不允许支付")
		return
	}

	now := time.Now()
	updates := map[string]interface{}{
		"status":         OrderStatusPaid,
		"payment_status": 1,
		"payment_method": "online",
		"payment_time":   &now,
	}

	if result := config.DB.Model(&order).Updates(updates); result.Error != nil {
		utils.ServerError(c, "支付失败")
		return
	}

	payment := models.Payment{
		OrderID:   order.ID,
		PaymentNo: utils.GeneratePaymentNo(),
		Amount:    order.TotalPrice,
		Method:    "online",
		Status:    1,
		PaymentTime: &now,
	}
	config.DB.Create(&payment)

	var orderItems []models.OrderItem
	config.DB.Where("order_id = ?", order.ID).Find(&orderItems)
	for _, item := range orderItems {
		config.DB.Model(&models.Product{}).Where("id = ?", item.ProductID).
			UpdateColumn("sales", gorm.Expr("sales + ?", item.Quantity))
	}

	utils.SuccessWithMessage(c, "支付成功", nil)
}

func CancelOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")

	var order models.Order
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).Preload("Items").First(&order); result.Error != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.Status != OrderStatusPending && order.Status != OrderStatusPaid {
		utils.BadRequest(c, "订单状态不允许取消")
		return
	}

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		if order.Status == OrderStatusPaid {
			for _, item := range order.Items {
				if result := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
					UpdateColumn("stock", gorm.Expr("stock + ?", item.Quantity)); result.Error != nil {
					return result.Error
				}
			}
		}

		if result := tx.Model(&order).Update("status", OrderStatusCancelled); result.Error != nil {
			return result.Error
		}

		return nil
	})

	if err != nil {
		utils.ServerError(c, "取消失败")
		return
	}

	utils.SuccessWithMessage(c, "取消成功", nil)
}

func ConfirmOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")

	var order models.Order
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&order); result.Error != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.Status != OrderStatusShipped {
		utils.BadRequest(c, "订单状态不允许确认收货")
		return
	}

	now := time.Now()
	config.DB.Model(&order).Updates(map[string]interface{}{
		"status":        OrderStatusCompleted,
		"complete_time": &now,
	})

	utils.SuccessWithMessage(c, "确认收货成功", nil)
}

func RequestRefund(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")

	var order models.Order
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&order); result.Error != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.Status != OrderStatusPaid && order.Status != OrderStatusShipped {
		utils.BadRequest(c, "订单状态不允许退款")
		return
	}

	config.DB.Model(&order).Update("status", OrderStatusRefunded)

	utils.SuccessWithMessage(c, "退款申请已提交", nil)
}
