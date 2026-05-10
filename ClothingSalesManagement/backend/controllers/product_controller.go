package controllers

import (
	"clothingsales/database"
	"clothingsales/models"
	"clothingsales/utils"

	"github.com/gin-gonic/gin"
)

type ProductController struct{}

func NewProductController() *ProductController {
	return &ProductController{}
}

func (pc *ProductController) GetCategoryTree(c *gin.Context) {
	var categories []models.Category
	database.DB.Where("status = 1").Order("sort_order ASC, id ASC").Find(&categories)

	tree := buildCategoryTree(categories, 0)
	utils.Success(c, tree)
}

func buildCategoryTree(categories []models.Category, parentID uint) []models.Category {
	var tree []models.Category
	for _, cat := range categories {
		if (cat.ParentID == nil && parentID == 0) || (cat.ParentID != nil && *cat.ParentID == parentID) {
			cat.Children = buildCategoryTree(categories, cat.ID)
			tree = append(tree, cat)
		}
	}
	return tree
}

func (pc *ProductController) GetProductList(c *gin.Context) {
	var products []models.Product
	query := database.DB.Where("status = 1")

	if categoryID := c.Query("category_id"); categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	if keyword := c.Query("keyword"); keyword != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	query.Model(&models.Product{}).Count(&total)

	page := 1
	pageSize := 12
	if p := c.Query("page"); p != "" {
		page = toInt(p)
	}
	if ps := c.Query("page_size"); ps != "" {
		pageSize = toInt(ps)
	}

	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&products)

	utils.Success(c, gin.H{
		"list":  products,
		"total": total,
		"page":  page,
	})
}

func (pc *ProductController) GetProductDetail(c *gin.Context) {
	id := c.Param("id")

	var product models.Product
	if err := database.DB.First(&product, id).Error; err != nil {
		utils.NotFound(c, "商品不存在")
		return
	}

	utils.Success(c, product)
}

func (pc *ProductController) AdminGetProductList(c *gin.Context) {
	var products []models.Product
	query := database.DB

	if categoryID := c.Query("category_id"); categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if keyword := c.Query("keyword"); keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Model(&models.Product{}).Count(&total)

	page := 1
	pageSize := 10
	if p := c.Query("page"); p != "" {
		page = toInt(p)
	}
	if ps := c.Query("page_size"); ps != "" {
		pageSize = toInt(ps)
	}

	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&products)

	utils.Success(c, gin.H{
		"list":  products,
		"total": total,
		"page":  page,
	})
}

type CreateProductRequest struct {
	Name          string  `json:"name" binding:"required"`
	Description   string  `json:"description"`
	Price         float64 `json:"price" binding:"required"`
	OriginalPrice float64 `json:"original_price"`
	Stock         int     `json:"stock"`
	CategoryID    uint    `json:"category_id"`
	Image         string  `json:"image"`
	Images        string  `json:"images"`
}

func (pc *ProductController) CreateProduct(c *gin.Context) {
	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	product := models.Product{
		Name:          req.Name,
		Description:   req.Description,
		Price:         req.Price,
		OriginalPrice: req.OriginalPrice,
		Stock:         req.Stock,
		CategoryID:    req.CategoryID,
		Image:         req.Image,
		Images:        req.Images,
		Status:        1,
	}

	if err := database.DB.Create(&product).Error; err != nil {
		utils.InternalError(c, "创建失败: "+err.Error())
		return
	}

	utils.Success(c, product)
}

func (pc *ProductController) UpdateProduct(c *gin.Context) {
	id := c.Param("id")

	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	updates := map[string]interface{}{
		"name":           req.Name,
		"description":    req.Description,
		"price":          req.Price,
		"original_price": req.OriginalPrice,
		"stock":          req.Stock,
		"category_id":    req.CategoryID,
	}
	if req.Image != "" {
		updates["image"] = req.Image
	}
	if req.Images != "" {
		updates["images"] = req.Images
	}

	if err := database.DB.Model(&models.Product{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		utils.InternalError(c, "更新失败")
		return
	}

	var product models.Product
	database.DB.First(&product, id)
	utils.Success(c, product)
}

func (pc *ProductController) DeleteProduct(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Product{}, id).Error; err != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func (pc *ProductController) OnShelfProduct(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Model(&models.Product{}).Where("id = ?", id).Update("status", 1).Error; err != nil {
		utils.InternalError(c, "上架失败")
		return
	}

	utils.SuccessWithMessage(c, "上架成功", nil)
}

func (pc *ProductController) OffShelfProduct(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Model(&models.Product{}).Where("id = ?", id).Update("status", 0).Error; err != nil {
		utils.InternalError(c, "下架失败")
		return
	}

	utils.SuccessWithMessage(c, "下架成功", nil)
}
