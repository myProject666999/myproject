package controllers

import (
	"net/http"

	"jingang-hotel-backend/config"
	"jingang-hotel-backend/models"

	"github.com/gin-gonic/gin"
)

type ReviewController struct{}

func (c *ReviewController) GetReviews(ctx *gin.Context) {
	var reviews []models.Review
	config.DB.Where("status = ?", 1).
		Preload("User").
		Order("created_at desc").
		Find(&reviews)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": reviews,
	})
}

func (c *ReviewController) GetMyReviews(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")
	status := ctx.Query("status")

	var reviews []models.Review
	query := config.DB.Where("user_id = ?", userId)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Preload("Order").Preload("Order.Room").Preload("Order.Room.RoomType").
		Order("created_at desc").
		Find(&reviews)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": reviews,
	})
}

func (c *ReviewController) CreateReview(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")

	var req struct {
		OrderID uint   `json:"orderId" binding:"required"`
		Rating  int    `json:"rating" binding:"required"`
		Content string `json:"content" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var order models.Order
	config.DB.Where("id = ? AND user_id = ?", req.OrderID, userId).First(&order)
	if order.ID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "订单不存在"})
		return
	}

	if order.Status != 4 {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "只能评价已完成的订单"})
		return
	}

	var existingReview models.Review
	config.DB.Where("order_id = ?", req.OrderID).First(&existingReview)
	if existingReview.ID > 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "该订单已评价"})
		return
	}

	review := models.Review{
		UserID:  userId.(uint),
		OrderID: req.OrderID,
		Rating:  req.Rating,
		Content: req.Content,
		Status:  0,
	}

	config.DB.Create(&review)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "评价提交成功"})
}

func (c *ReviewController) GetAdminReviews(ctx *gin.Context) {
	var reviews []models.Review
	config.DB.Preload("User").Preload("Order").Preload("Order.Room").
		Order("created_at desc").
		Find(&reviews)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": reviews,
	})
}

func (c *ReviewController) AuditReview(ctx *gin.Context) {
	id := ctx.Param("id")
	var req struct {
		Status int    `json:"status" binding:"required"`
		Reply  string `json:"reply"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var review models.Review
	config.DB.First(&review, id)
	if review.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "评价不存在"})
		return
	}

	review.Status = req.Status
	review.Reply = req.Reply
	config.DB.Save(&review)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "审核成功"})
}
