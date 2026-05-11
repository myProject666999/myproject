package controllers

import (
	"campus-trading/config"
	"campus-trading/models"
	"campus-trading/utils"

	"github.com/gin-gonic/gin"
)

func GetCart(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var cartItems []models.Cart
	if result := config.DB.Where("user_id = ?", userID).Preload("Product").Find(&cartItems); result.Error != nil {
		utils.ServerError(c, "查询失败")
		return
	}

	utils.Success(c, cartItems)
}

func AddToCart(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req struct {
		ProductID uint `json:"product_id" binding:"required"`
		Quantity  int  `json:"quantity"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if req.Quantity <= 0 {
		req.Quantity = 1
	}

	var product models.Product
	if result := config.DB.First(&product, req.ProductID); result.Error != nil {
		utils.NotFound(c, "商品不存在")
		return
	}

	if product.Status != 1 {
		utils.BadRequest(c, "商品已下架")
		return
	}

	if product.Stock < req.Quantity {
		utils.BadRequest(c, "库存不足")
		return
	}

	var existingCart models.Cart
	result := config.DB.Where("user_id = ? AND product_id = ?", userID, req.ProductID).First(&existingCart)

	if result.Error == nil {
		newQuantity := existingCart.Quantity + req.Quantity
		if newQuantity > product.Stock {
			utils.BadRequest(c, "库存不足")
			return
		}
		config.DB.Model(&existingCart).Update("quantity", newQuantity)
	} else {
		cart := models.Cart{
			UserID:    userID.(uint),
			ProductID: req.ProductID,
			Quantity:  req.Quantity,
		}
		if result := config.DB.Create(&cart); result.Error != nil {
			utils.ServerError(c, "添加失败")
			return
		}
	}

	utils.SuccessWithMessage(c, "添加成功", nil)
}

func UpdateCart(c *gin.Context) {
	userID, _ := c.Get("user_id")
	cartID := c.Param("id")

	var req struct {
		Quantity int `json:"quantity" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if req.Quantity <= 0 {
		utils.BadRequest(c, "数量必须大于0")
		return
	}

	var cart models.Cart
	if result := config.DB.Where("id = ? AND user_id = ?", cartID, userID).Preload("Product").First(&cart); result.Error != nil {
		utils.NotFound(c, "购物车项不存在")
		return
	}

	if cart.Product.Stock < req.Quantity {
		utils.BadRequest(c, "库存不足")
		return
	}

	config.DB.Model(&cart).Update("quantity", req.Quantity)

	utils.SuccessWithMessage(c, "更新成功", nil)
}

func DeleteCart(c *gin.Context) {
	userID, _ := c.Get("user_id")
	cartID := c.Param("id")

	var cart models.Cart
	if result := config.DB.Where("id = ? AND user_id = ?", cartID, userID).First(&cart); result.Error != nil {
		utils.NotFound(c, "购物车项不存在")
		return
	}

	config.DB.Delete(&cart)

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func ClearCart(c *gin.Context) {
	userID, _ := c.Get("user_id")

	config.DB.Where("user_id = ?", userID).Delete(&models.Cart{})

	utils.SuccessWithMessage(c, "清空成功", nil)
}

func GetCartCount(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var count int64
	config.DB.Model(&models.Cart{}).Where("user_id = ?", userID).Count(&count)

	utils.Success(c, gin.H{"count": count})
}
