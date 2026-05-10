package controllers

import (
	"clothingsales/database"
	"clothingsales/models"
	"clothingsales/utils"

	"github.com/gin-gonic/gin"
)

type CategoryController struct{}

func NewCategoryController() *CategoryController {
	return &CategoryController{}
}

type CreateCategoryRequest struct {
	Name      string `json:"name" binding:"required"`
	ParentID  *uint  `json:"parent_id"`
	SortOrder int    `json:"sort_order"`
}

func (cc *CategoryController) GetCategories(c *gin.Context) {
	var categories []models.Category
	database.DB.Order("sort_order ASC, id ASC").Find(&categories)
	utils.Success(c, categories)
}

func (cc *CategoryController) CreateCategory(c *gin.Context) {
	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	category := models.Category{
		Name:      req.Name,
		ParentID:  req.ParentID,
		SortOrder: req.SortOrder,
		Status:    1,
	}

	if err := database.DB.Create(&category).Error; err != nil {
		utils.InternalError(c, "创建失败")
		return
	}

	utils.Success(c, category)
}

func (cc *CategoryController) UpdateCategory(c *gin.Context) {
	id := c.Param("id")

	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := database.DB.Model(&models.Category{}).Where("id = ?", id).Updates(map[string]interface{}{
		"name":       req.Name,
		"parent_id":  req.ParentID,
		"sort_order": req.SortOrder,
	}).Error; err != nil {
		utils.InternalError(c, "更新失败")
		return
	}

	var category models.Category
	database.DB.First(&category, id)
	utils.Success(c, category)
}

func (cc *CategoryController) DeleteCategory(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Category{}, id).Error; err != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}
