package handlers

import (
	"group-buying/config"
	"group-buying/models"
	"group-buying/utils"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OrderResponse struct {
	ID           uint    `json:"id"`
	OrderNo      string  `json:"order_no"`
	UserID       uint    `json:"user_id"`
	GroupID      uint    `json:"group_id"`
	ProductID    uint    `json:"product_id"`
	ProductName  string  `json:"product_name"`
	ProductImage string  `json:"product_image"`
	UnitPrice    float64 `json:"unit_price"`
	Quantity     int     `json:"quantity"`
	TotalAmount  float64 `json:"total_amount"`
	PayAmount    float64 `json:"pay_amount"`
	Status       int     `json:"status"`
	PayTime      string  `json:"pay_time"`
	RefundTime   string  `json:"refund_time"`
	CreatedAt    string  `json:"created_at"`
}

func GetMyOrders(c *gin.Context) {
	userID := c.GetUint("user_id")
	status := c.Query("status")
	var orders []models.Order
	query := config.DB.Where("user_id = ?", userID)
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Order("id DESC").Find(&orders)
	var resp []OrderResponse
	for _, o := range orders {
		resp = append(resp, OrderResponse{
			ID:           o.ID,
			OrderNo:      o.OrderNo,
			UserID:       o.UserID,
			GroupID:      o.GroupID,
			ProductID:    o.ProductID,
			ProductName:  o.ProductName,
			ProductImage: o.ProductImage,
			UnitPrice:    o.UnitPrice,
			Quantity:     o.Quantity,
			TotalAmount:  o.TotalAmount,
			PayAmount:    o.PayAmount,
			Status:       o.Status,
			PayTime:      formatTime(o.PayTime),
			RefundTime:   formatTime(o.RefundTime),
			CreatedAt:    o.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}
	utils.Success(c, resp)
}

func GetOrderDetail(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")
	var order models.Order
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&order).Error; err != nil {
		utils.Fail(c, 404, "订单不存在")
		return
	}
	utils.Success(c, OrderResponse{
		ID:           order.ID,
		OrderNo:      order.OrderNo,
		UserID:       order.UserID,
		GroupID:      order.GroupID,
		ProductID:    order.ProductID,
		ProductName:  order.ProductName,
		ProductImage: order.ProductImage,
		UnitPrice:    order.UnitPrice,
		Quantity:     order.Quantity,
		TotalAmount:  order.TotalAmount,
		PayAmount:    order.PayAmount,
		Status:       order.Status,
		PayTime:      formatTime(order.PayTime),
		RefundTime:   formatTime(order.RefundTime),
		CreatedAt:    order.CreatedAt.Format("2006-01-02 15:04:05"),
	})
}

func formatTime(t *time.Time) string {
	if t == nil {
		return ""
	}
	return t.Format("2006-01-02 15:04:05")
}

func RefundOrder(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")
	var order models.Order
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&order).Error; err != nil {
		utils.Fail(c, 404, "订单不存在")
		return
	}
	if order.Status != 1 {
		utils.Fail(c, 400, "当前订单状态不支持退款")
		return
	}
	var group models.GroupBuying
	if err := config.DB.First(&group, order.GroupID).Error; err != nil {
		utils.Fail(c, 404, "拼团不存在")
		return
	}
	if group.Status == 1 {
		utils.Fail(c, 400, "拼团已成团，无法退款")
		return
	}
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		var user models.User
		tx.First(&user, userID)
		tx.Model(&user).Update("balance", user.Balance+order.PayAmount)
		now := time.Now()
		tx.Model(&order).Updates(map[string]interface{}{
			"status":      2,
			"refund_time": now,
		})
		tx.Model(&models.GroupParticipant{}).
			Where("group_id = ? AND user_id = ?", order.GroupID, userID).
			Update("status", 2)
		tx.Model(&models.GroupBuying{}).
			Where("id = ?", order.GroupID).
			UpdateColumn("current_size", gorm.Expr("current_size - 1"))
		refund := models.Refund{
			OrderID:     order.ID,
			UserID:      uint(userID),
			GroupID:     order.GroupID,
			Amount:      order.PayAmount,
			Reason:      "用户主动退款",
			Status:      1,
			ProcessedAt: &now,
		}
		tx.Create(&refund)
		return nil
	})
	if err != nil {
		utils.Fail(c, 500, "退款失败")
		return
	}
	utils.SuccessMsg(c, "退款成功")
}

func AdminGetOrders(c *gin.Context) {
	status := c.Query("status")
	var orders []models.Order
	query := config.DB
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Order("id DESC").Find(&orders)
	var resp []OrderResponse
	for _, o := range orders {
		resp = append(resp, OrderResponse{
			ID:           o.ID,
			OrderNo:      o.OrderNo,
			UserID:       o.UserID,
			GroupID:      o.GroupID,
			ProductID:    o.ProductID,
			ProductName:  o.ProductName,
			ProductImage: o.ProductImage,
			UnitPrice:    o.UnitPrice,
			Quantity:     o.Quantity,
			TotalAmount:  o.TotalAmount,
			PayAmount:    o.PayAmount,
			Status:       o.Status,
			PayTime:      formatTime(o.PayTime),
			RefundTime:   formatTime(o.RefundTime),
			CreatedAt:    o.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}
	utils.Success(c, resp)
}

func AdminGetRefunds(c *gin.Context) {
	var refunds []models.Refund
	config.DB.Order("id DESC").Find(&refunds)
	utils.Success(c, refunds)
}

func GetMyRefunds(c *gin.Context) {
	userID := c.GetUint("user_id")
	var refunds []models.Refund
	config.DB.Where("user_id = ?", userID).Order("id DESC").Find(&refunds)
	utils.Success(c, refunds)
}

func AdminGetStatistics(c *gin.Context) {
	var userCount int64
	var groupCount int64
	var orderCount int64
	var totalAmount float64
	config.DB.Model(&models.User{}).Where("role = ?", 0).Count(&userCount)
	config.DB.Model(&models.GroupBuying{}).Count(&groupCount)
	config.DB.Model(&models.Order{}).Where("status = ?", 1).Count(&orderCount)
	config.DB.Model(&models.Order{}).Where("status = ?", 1).Select("COALESCE(SUM(pay_amount), 0)").Scan(&totalAmount)
	var activeGroupCount int64
	var successGroupCount int64
	config.DB.Model(&models.GroupBuying{}).Where("status = ?", 0).Count(&activeGroupCount)
	config.DB.Model(&models.GroupBuying{}).Where("status = ?", 1).Count(&successGroupCount)
	utils.Success(c, gin.H{
		"user_count":        userCount,
		"group_count":       groupCount,
		"order_count":       orderCount,
		"total_amount":      totalAmount,
		"active_group_count": activeGroupCount,
		"success_group_count": successGroupCount,
	})
}

func AdminUpdateOrderStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status int `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, "参数错误")
		return
	}
	if err := config.DB.Model(&models.Order{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		utils.Fail(c, 500, "更新失败")
		return
	}
	utils.SuccessMsg(c, "更新成功")
}
