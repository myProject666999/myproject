package controllers

import (
	"campus-trading/config"
	"campus-trading/models"
	"campus-trading/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetProducts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")
	status := c.Query("status")

	query := config.DB.Model(&models.Product{}).Preload("Category")

	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}
	if keyword != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	} else {
		query = query.Where("status = 1")
	}

	var total int64
	query.Count(&total)

	var products []models.Product
	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&products)

	utils.Success(c, utils.PageResult{
		List:     products,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

func GetProduct(c *gin.Context) {
	id := c.Param("id")

	var product models.Product
	if result := config.DB.Preload("Category").First(&product, id); result.Error != nil {
		utils.NotFound(c, "商品不存在")
		return
	}

	config.DB.Model(&product).Update("views", product.Views+1)

	utils.Success(c, product)
}

func GetComments(c *gin.Context) {
	productID := c.Param("id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := config.DB.Model(&models.Comment{}).Where("product_id = ?", productID).Preload("User")

	var total int64
	query.Count(&total)

	var comments []models.Comment
	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&comments)

	utils.Success(c, utils.PageResult{
		List:     comments,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

func AddComment(c *gin.Context) {
	userID, _ := c.Get("user_id")
	productID := c.Param("id")

	var req struct {
		Content string `json:"content" binding:"required"`
		Rating  int    `json:"rating"`
		Images  string `json:"images"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	prodID, _ := strconv.Atoi(productID)
	comment := models.Comment{
		UserID:    userID.(uint),
		ProductID: uint(prodID),
		Content:   req.Content,
		Rating:    req.Rating,
		Images:    req.Images,
	}

	if result := config.DB.Create(&comment); result.Error != nil {
		utils.ServerError(c, "评论失败")
		return
	}

	utils.Success(c, comment)
}

func GetCategories(c *gin.Context) {
	var categories []models.Category
	if result := config.DB.Where("status = 1").Order("sort ASC").Find(&categories); result.Error != nil {
		utils.ServerError(c, "查询失败")
		return
	}

	utils.Success(c, categories)
}

func GetHotProducts(c *gin.Context) {
	limit := 8
	if l := c.Query("limit"); l != "" {
		limit, _ = strconv.Atoi(l)
	}

	var products []models.Product
	config.DB.Where("status = 1").Order("sales DESC").Limit(limit).Find(&products)

	utils.Success(c, products)
}

func GetNewProducts(c *gin.Context) {
	limit := 8
	if l := c.Query("limit"); l != "" {
		limit, _ = strconv.Atoi(l)
	}

	var products []models.Product
	config.DB.Where("status = 1").Order("created_at DESC").Limit(limit).Find(&products)

	utils.Success(c, products)
}

func ToggleFavorite(c *gin.Context) {
	userID, _ := c.Get("user_id")
	productID := c.Param("id")

	prodID, _ := strconv.Atoi(productID)

	var favorite models.Favorite
	result := config.DB.Where("user_id = ? AND product_id = ?", userID, prodID).First(&favorite)

	if result.Error == nil {
		config.DB.Delete(&favorite)
		utils.SuccessWithMessage(c, "取消收藏", gin.H{"is_favorite": false})
		return
	}

	favorite = models.Favorite{
		UserID:    userID.(uint),
		ProductID: uint(prodID),
	}
	if result := config.DB.Create(&favorite); result.Error != nil {
		utils.ServerError(c, "收藏失败")
		return
	}

	utils.SuccessWithMessage(c, "收藏成功", gin.H{"is_favorite": true})
}

func IsFavorite(c *gin.Context) {
	userID, _ := c.Get("user_id")
	productID := c.Param("id")

	prodID, _ := strconv.Atoi(productID)

	var count int64
	config.DB.Model(&models.Favorite{}).Where("user_id = ? AND product_id = ?", userID, prodID).Count(&count)

	utils.Success(c, gin.H{"is_favorite": count > 0})
}

func GetFavorites(c *gin.Context) {
	userID, _ := c.Get("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	query := config.DB.Model(&models.Favorite{}).Where("user_id = ?", userID).Preload("Product.Category")

	var total int64
	query.Count(&total)

	var favorites []models.Favorite
	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&favorites)

	utils.Success(c, utils.PageResult{
		List:     favorites,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}
