package controllers

import (
	"net/http"

	"jingang-hotel-backend/config"
	"jingang-hotel-backend/models"
	"jingang-hotel-backend/utils"

	"github.com/gin-gonic/gin"
)

type MemberController struct{}

func (c *MemberController) GetPointsRecords(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")

	var records []models.PointsRecord
	config.DB.Where("user_id = ?", userId).
		Order("created_at desc").
		Find(&records)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": records,
	})
}

func (c *MemberController) GetProducts(ctx *gin.Context) {
	var products []models.Product
	config.DB.Where("status = ? AND stock > 0", 1).Find(&products)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": products,
	})
}

func (c *MemberController) ExchangeProduct(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")

	var req struct {
		ProductID uint `json:"productId" binding:"required"`
		Quantity  int  `json:"quantity" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var product models.Product
	config.DB.First(&product, req.ProductID)
	if product.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "商品不存在"})
		return
	}

	if product.Stock < req.Quantity {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "库存不足"})
		return
	}

	var user models.User
	config.DB.First(&user, userId)

	totalPoints := product.Points * req.Quantity
	if user.MemberPoints < totalPoints {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "积分不足"})
		return
	}

	productOrder := models.ProductOrder{
		OrderNo:     utils.GenerateOrderNo("PO"),
		UserID:      userId.(uint),
		ProductID:   product.ID,
		Quantity:    req.Quantity,
		TotalPoints: totalPoints,
		Status:      1,
	}

	config.DB.Create(&productOrder)

	product.Stock -= req.Quantity
	config.DB.Save(&product)

	user.MemberPoints -= totalPoints
	config.DB.Save(&user)

	config.DB.Create(&models.PointsRecord{
		UserID: userId.(uint),
		Type:   2,
		Points: totalPoints,
		Reason: "积分兑换商品",
	})

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "兑换成功"})
}

func (c *MemberController) GetProductOrders(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")

	var orders []models.ProductOrder
	config.DB.Where("user_id = ?", userId).
		Preload("Product").
		Order("created_at desc").
		Find(&orders)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": orders,
	})
}

func (c *MemberController) GetAdminProducts(ctx *gin.Context) {
	var products []models.Product
	config.DB.Find(&products)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": products,
	})
}

func (c *MemberController) CreateProduct(ctx *gin.Context) {
	var req models.Product
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&req).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功"})
}

func (c *MemberController) UpdateProduct(ctx *gin.Context) {
	id := ctx.Param("id")
	var product models.Product
	config.DB.First(&product, id)

	if product.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "商品不存在"})
		return
	}

	var req models.Product
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Model(&product).Updates(req)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (c *MemberController) DeleteProduct(ctx *gin.Context) {
	id := ctx.Param("id")
	config.DB.Delete(&models.Product{}, id)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
