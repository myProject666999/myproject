package controllers

import (
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"strayanimalrescueplatform/config"
	"strayanimalrescueplatform/models"
	"strayanimalrescueplatform/utils"
)

func generateOrderNo() string {
	return fmt.Sprintf("ORD%s%d", time.Now().Format("20060102150405"), time.Now().UnixNano()%10000)
}

func GetOrders(c *gin.Context) {
	userID := c.GetUint("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	db := config.GetDB()
	query := db.Model(&models.Order{}).Where("user_id = ?", userID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int
	query.Count(&total)

	var orders []models.Order
	query.Preload("OrderItems.Product").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&orders)

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      orders,
	})
}

func GetOrder(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	var order models.Order
	db := config.GetDB()
	if err := db.Preload("OrderItems.Product").Where("id = ? AND user_id = ?", id, userID).First(&order).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	utils.Success(c, order)
}

func CreateOrder(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		CartIDs         []uint `json:"cart_ids" binding:"required"`
		ShippingName    string `json:"shipping_name" binding:"required"`
		ShippingPhone   string `json:"shipping_phone" binding:"required"`
		ShippingAddress string `json:"shipping_address" binding:"required"`
		PaymentMethod   string `json:"payment_method"`
		Remark          string `json:"remark"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db := config.GetDB()

	var cartItems []models.Cart
	db.Preload("Product").Where("id IN (?)", req.CartIDs).Find(&cartItems)

	if len(cartItems) == 0 {
		utils.BadRequest(c, "购物车为空")
		return
	}

	var totalAmount float64
	var orderItems []models.OrderItem

	for _, item := range cartItems {
		totalPrice := item.Product.Price * float64(item.Quantity)
		totalAmount += totalPrice

		orderItems = append(orderItems, models.OrderItem{
			ProductID:   item.ProductID,
			ProductName: item.Product.Name,
			Price:       item.Product.Price,
			Quantity:    item.Quantity,
			TotalPrice:  totalPrice,
		})
	}

	order := models.Order{
		OrderNo:         generateOrderNo(),
		UserID:          userID,
		TotalAmount:     totalAmount,
		Status:          "pending",
		PaymentMethod:   req.PaymentMethod,
		ShippingName:    req.ShippingName,
		ShippingPhone:   req.ShippingPhone,
		ShippingAddress: req.ShippingAddress,
		Remark:          req.Remark,
	}

	tx := db.Begin()
	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		utils.InternalServerError(c, "创建订单失败")
		return
	}

	for i := range orderItems {
		orderItems[i].OrderID = order.ID
	}

	if err := tx.Create(&orderItems).Error; err != nil {
		tx.Rollback()
		utils.InternalServerError(c, "创建订单项失败")
		return
	}

	if err := tx.Where("id IN (?)", req.CartIDs).Delete(&models.Cart{}).Error; err != nil {
		tx.Rollback()
		utils.InternalServerError(c, "清空购物车失败")
		return
	}

	tx.Commit()

	var resultOrder models.Order
	db.Preload("OrderItems.Product").First(&resultOrder, order.ID)

	utils.Success(c, resultOrder)
}

func PayOrder(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	db := config.GetDB()
	var order models.Order
	if err := db.Where("id = ? AND user_id = ?", id, userID).First(&order).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.Status != "pending" {
		utils.BadRequest(c, "订单状态不正确")
		return
	}

	now := time.Now()
	order.Status = "paid"
	order.PaidAt = &now
	db.Save(&order)

	utils.SuccessWithMessage(c, "支付成功", nil)
}

func CancelOrder(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	db := config.GetDB()
	var order models.Order
	if err := db.Where("id = ? AND user_id = ?", id, userID).First(&order).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.Status != "pending" {
		utils.BadRequest(c, "订单状态不正确")
		return
	}

	now := time.Now()
	order.Status = "cancelled"
	order.CanceledAt = &now
	db.Save(&order)

	utils.SuccessWithMessage(c, "订单已取消", nil)
}

func ConfirmReceive(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	db := config.GetDB()
	var order models.Order
	if err := db.Where("id = ? AND user_id = ?", id, userID).First(&order).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.Status != "shipped" {
		utils.BadRequest(c, "订单状态不正确")
		return
	}

	now := time.Now()
	order.Status = "completed"
	order.CompletedAt = &now
	db.Save(&order)

	utils.SuccessWithMessage(c, "确认收货成功", nil)
}
