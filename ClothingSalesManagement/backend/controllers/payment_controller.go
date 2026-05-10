package controllers

import (
	"time"

	"clothingsales/database"
	"clothingsales/models"
	"clothingsales/utils"

	"github.com/gin-gonic/gin"
)

type PaymentController struct{}

func NewPaymentController() *PaymentController {
	return &PaymentController{}
}

type PayRequest struct {
	OrderID uint   `json:"order_id" binding:"required"`
	PayType string `json:"pay_type" binding:"required"`
}

func (pc *PaymentController) Pay(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req PayRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var order models.Order
	if err := database.DB.Where("id = ? AND user_id = ?", req.OrderID, userID).First(&order).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.PayStatus == 1 {
		utils.BadRequest(c, "订单已支付")
		return
	}

	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	payment := models.Payment{
		OrderID: order.ID,
		OrderNo: order.OrderNo,
		PayNo:   "PAY" + time.Now().Format("20060102150405"),
		PayType: req.PayType,
		Amount:  order.TotalAmount,
		Status:  1,
		PayTime: time.Now(),
	}

	if err := tx.Create(&payment).Error; err != nil {
		tx.Rollback()
		utils.InternalError(c, "支付记录创建失败")
		return
	}

	if err := tx.Model(&order).Updates(map[string]interface{}{
		"pay_status": 1,
		"pay_type":   req.PayType,
		"status":     1,
	}).Error; err != nil {
		tx.Rollback()
		utils.InternalError(c, "订单状态更新失败")
		return
	}

	tx.Commit()

	utils.SuccessWithMessage(c, "支付成功", gin.H{
		"order_id": order.ID,
		"pay_no":   payment.PayNo,
	})
}

func (pc *PaymentController) MockPay(c *gin.Context) {
	userID, _ := c.Get("userID")
	orderID := c.Param("id")

	var order models.Order
	if err := database.DB.Where("id = ? AND user_id = ?", orderID, userID).First(&order).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.PayStatus == 1 {
		utils.SuccessWithMessage(c, "订单已支付", gin.H{
			"order_id": order.ID,
		})
		return
	}

	tx := database.DB.Begin()

	payment := models.Payment{
		OrderID: order.ID,
		OrderNo: order.OrderNo,
		PayNo:   "MOCK" + time.Now().Format("20060102150405"),
		PayType: "mock",
		Amount:  order.TotalAmount,
		Status:  1,
		PayTime: time.Now(),
	}

	if err := tx.Create(&payment).Error; err != nil {
		tx.Rollback()
		utils.InternalError(c, "支付失败")
		return
	}

	if err := tx.Model(&order).Updates(map[string]interface{}{
		"pay_status": 1,
		"pay_type":   "mock",
		"status":     1,
	}).Error; err != nil {
		tx.Rollback()
		utils.InternalError(c, "支付失败")
		return
	}

	tx.Commit()

	utils.SuccessWithMessage(c, "模拟支付成功", gin.H{
		"order_id": order.ID,
		"pay_no":   payment.PayNo,
	})
}
