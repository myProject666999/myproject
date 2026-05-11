package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"strayanimalrescueplatform/config"
	"strayanimalrescueplatform/models"
	"strayanimalrescueplatform/utils"
)

func GetProducts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")

	db := config.GetDB()
	query := db.Model(&models.Product{}).Where("status = ?", 1)

	if categoryID != "" {
		query = query.Where("product_category_id = ?", categoryID)
	}
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	var total int
	query.Count(&total)

	var products []models.Product
	query.Preload("ProductCategory").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&products)

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      products,
	})
}

func GetProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var product models.Product
	db := config.GetDB()
	if err := db.Preload("ProductCategory").First(&product, id).Error; err != nil {
		utils.NotFound(c, "商品不存在")
		return
	}
	utils.Success(c, product)
}

func CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db := config.GetDB()
	if err := db.Create(&product).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}
	utils.Success(c, product)
}

func UpdateProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var product models.Product
	db := config.GetDB()
	if err := db.First(&product, id).Error; err != nil {
		utils.NotFound(c, "商品不存在")
		return
	}

	if err := c.ShouldBindJSON(&product); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db.Save(&product)
	utils.Success(c, product)
}

func DeleteProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	db := config.GetDB()
	if err := db.Delete(&models.Product{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}

func GetCart(c *gin.Context) {
	userID := c.GetUint("user_id")
	var cartItems []models.Cart
	db := config.GetDB()
	db.Preload("Product").Where("user_id = ?", userID).Find(&cartItems)
	utils.Success(c, cartItems)
}

func AddToCart(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req struct {
		ProductID uint `json:"product_id" binding:"required"`
		Quantity  int  `json:"quantity" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db := config.GetDB()
	var cart models.Cart
	if db.Where("user_id = ? AND product_id = ?", userID, req.ProductID).First(&cart).RecordNotFound() {
		cart = models.Cart{
			UserID:    userID,
			ProductID: req.ProductID,
			Quantity:  req.Quantity,
		}
		db.Create(&cart)
	} else {
		cart.Quantity += req.Quantity
		db.Save(&cart)
	}

	utils.Success(c, cart)
}

func UpdateCart(c *gin.Context) {
	userID := c.GetUint("user_id")
	cartID, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Quantity int `json:"quantity" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db := config.GetDB()
	var cart models.Cart
	if err := db.Where("id = ? AND user_id = ?", cartID, userID).First(&cart).Error; err != nil {
		utils.NotFound(c, "购物车项不存在")
		return
	}

	cart.Quantity = req.Quantity
	db.Save(&cart)
	utils.Success(c, cart)
}

func RemoveFromCart(c *gin.Context) {
	userID := c.GetUint("user_id")
	cartID, _ := strconv.Atoi(c.Param("id"))

	db := config.GetDB()
	if err := db.Where("id = ? AND user_id = ?", cartID, userID).Delete(&models.Cart{}).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}
