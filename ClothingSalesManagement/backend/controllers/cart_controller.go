package controllers

import (
	"clothingsales/database"
	"clothingsales/models"
	"clothingsales/utils"

	"github.com/gin-gonic/gin"
)

type CartController struct{}

func NewCartController() *CartController {
	return &CartController{}
}

type AddToCartRequest struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity"`
}

func (cc *CartController) GetCart(c *gin.Context) {
	userID, _ := c.Get("userID")

	var cartItems []models.Cart
	database.DB.Where("user_id = ?", userID).Preload("Product").Find(&cartItems)

	utils.Success(c, cartItems)
}

func (cc *CartController) AddToCart(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	quantity := req.Quantity
	if quantity <= 0 {
		quantity = 1
	}

	var existingCart models.Cart
	if err := database.DB.Where("user_id = ? AND product_id = ?", userID, req.ProductID).First(&existingCart).Error; err == nil {
		database.DB.Model(&existingCart).Update("quantity", existingCart.Quantity+quantity)
	} else {
		cart := models.Cart{
			UserID:    userID.(uint),
			ProductID: req.ProductID,
			Quantity:  quantity,
		}
		database.DB.Create(&cart)
	}

	utils.SuccessWithMessage(c, "添加成功", nil)
}

func (cc *CartController) UpdateCart(c *gin.Context) {
	userID, _ := c.Get("userID")
	id := c.Param("id")

	var req AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var cart models.Cart
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&cart).Error; err != nil {
		utils.NotFound(c, "购物车项不存在")
		return
	}

	if req.Quantity <= 0 {
		database.DB.Delete(&cart)
	} else {
		database.DB.Model(&cart).Update("quantity", req.Quantity)
	}

	utils.SuccessWithMessage(c, "更新成功", nil)
}

func (cc *CartController) RemoveFromCart(c *gin.Context) {
	userID, _ := c.Get("userID")
	id := c.Param("id")

	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Cart{}).Error; err != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func (cc *CartController) ClearCart(c *gin.Context) {
	userID, _ := c.Get("userID")

	database.DB.Where("user_id = ?", userID).Delete(&models.Cart{})
	utils.SuccessWithMessage(c, "清空成功", nil)
}
