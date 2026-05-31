package handlers

import (
	"group-buying/config"
	"group-buying/models"
	"group-buying/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProductResponse struct {
	ID            uint    `json:"id"`
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	Images        string  `json:"images"`
	OriginalPrice float64 `json:"original_price"`
	Stock         int     `json:"stock"`
	Status        int     `json:"status"`
}

func GetProducts(c *gin.Context) {
	status := c.Query("status")
	var products []models.Product
	query := config.DB
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Order("id DESC").Find(&products)
	var resp []ProductResponse
	for _, p := range products {
		resp = append(resp, ProductResponse{
			ID:            p.ID,
			Name:          p.Name,
			Description:   p.Description,
			Images:        p.Images,
			OriginalPrice: p.OriginalPrice,
			Stock:         p.Stock,
			Status:        p.Status,
		})
	}
	utils.Success(c, resp)
}

func GetProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product
	if err := config.DB.First(&product, id).Error; err != nil {
		utils.Fail(c, 404, "商品不存在")
		return
	}
	utils.Success(c, ProductResponse{
		ID:            product.ID,
		Name:          product.Name,
		Description:   product.Description,
		Images:        product.Images,
		OriginalPrice: product.OriginalPrice,
		Stock:         product.Stock,
		Status:        product.Status,
	})
}

func AdminCreateProduct(c *gin.Context) {
	var req struct {
		Name          string  `json:"name" binding:"required"`
		Description   string  `json:"description"`
		Images        string  `json:"images"`
		OriginalPrice float64 `json:"original_price" binding:"required"`
		Stock         int     `json:"stock" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, "参数错误")
		return
	}
	product := models.Product{
		Name:          req.Name,
		Description:   req.Description,
		Images:        req.Images,
		OriginalPrice: req.OriginalPrice,
		Stock:         req.Stock,
		Status:        1,
	}
	if err := config.DB.Create(&product).Error; err != nil {
		utils.Fail(c, 500, "创建失败")
		return
	}
	utils.Success(c, gin.H{"id": product.ID})
}

func AdminUpdateProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product
	if err := config.DB.First(&product, id).Error; err != nil {
		utils.Fail(c, 404, "商品不存在")
		return
	}
	var req struct {
		Name          *string  `json:"name"`
		Description   *string  `json:"description"`
		Images        *string  `json:"images"`
		OriginalPrice *float64 `json:"original_price"`
		Stock         *int     `json:"stock"`
		Status        *int     `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, "参数错误")
		return
	}
	if req.Name != nil {
		product.Name = *req.Name
	}
	if req.Description != nil {
		product.Description = *req.Description
	}
	if req.Images != nil {
		product.Images = *req.Images
	}
	if req.OriginalPrice != nil {
		product.OriginalPrice = *req.OriginalPrice
	}
	if req.Stock != nil {
		product.Stock = *req.Stock
	}
	if req.Status != nil {
		product.Status = *req.Status
	}
	if err := config.DB.Save(&product).Error; err != nil {
		utils.Fail(c, 500, "更新失败")
		return
	}
	utils.SuccessMsg(c, "更新成功")
}

func AdminDeleteProduct(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Product{}, id).Error; err != nil {
		utils.Fail(c, 500, "删除失败")
		return
	}
	utils.SuccessMsg(c, "删除成功")
}

func GetProductsByPage(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))
	if page < 1 {
		page = 1
	}
	if size < 1 {
		size = 10
	}
	var total int64
	var products []models.Product
	config.DB.Model(&models.Product{}).Where("status = ?", 1).Count(&total)
	config.DB.Where("status = ?", 1).Offset((page - 1) * size).Limit(size).Order("id DESC").Find(&products)
	var resp []ProductResponse
	for _, p := range products {
		resp = append(resp, ProductResponse{
			ID:            p.ID,
			Name:          p.Name,
			Description:   p.Description,
			Images:        p.Images,
			OriginalPrice: p.OriginalPrice,
			Stock:         p.Stock,
			Status:        p.Status,
		})
	}
	utils.Success(c, gin.H{
		"total": total,
		"items": resp,
		"page":  page,
		"size":  size,
	})
}
