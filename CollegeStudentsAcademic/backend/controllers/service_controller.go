package controllers

import (
	"college-academic/database"
	"college-academic/models"
	"college-academic/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetServiceList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	category := c.Query("category")
	status := c.Query("status")
	onlyActive := c.Query("only_active")

	var services []models.Service
	var total int64

	query := database.DB.Model(&models.Service{})
	if keyword != "" {
		query = query.Where("title LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if onlyActive == "1" {
		query = query.Where("status = 1")
	}

	query.Count(&total)
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&services)

	utils.SuccessPage(c, services, total, page, pageSize)
}

func GetServiceDetail(c *gin.Context) {
	id := c.Param("id")

	var service models.Service
	if err := database.DB.First(&service, id).Error; err != nil {
		utils.Error(c, 404, "服务不存在")
		return
	}

	utils.Success(c, service)
}

func CreateService(c *gin.Context) {
	var req struct {
		Title       string  `json:"title" binding:"required"`
		Category    string  `json:"category"`
		Description string  `json:"description"`
		Content     string  `json:"content"`
		Cover       string  `json:"cover"`
		Consultant  string  `json:"consultant"`
		Price       float64 `json:"price"`
		Duration    string  `json:"duration"`
		Status      int     `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	service := models.Service{
		Title:       req.Title,
		Category:    req.Category,
		Description: req.Description,
		Content:     req.Content,
		Cover:       req.Cover,
		Consultant:  req.Consultant,
		Price:       req.Price,
		Duration:    req.Duration,
		Status:      req.Status,
	}

	if err := database.DB.Create(&service).Error; err != nil {
		utils.Error(c, 500, "创建失败")
		return
	}

	utils.Success(c, service)
}

func UpdateService(c *gin.Context) {
	id := c.Param("id")

	var service models.Service
	if err := database.DB.First(&service, id).Error; err != nil {
		utils.Error(c, 404, "服务不存在")
		return
	}

	var req struct {
		Title       string  `json:"title"`
		Category    string  `json:"category"`
		Description string  `json:"description"`
		Content     string  `json:"content"`
		Cover       string  `json:"cover"`
		Consultant  string  `json:"consultant"`
		Price       float64 `json:"price"`
		Duration    string  `json:"duration"`
		Status      int     `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	if req.Title != "" {
		service.Title = req.Title
	}
	service.Category = req.Category
	service.Description = req.Description
	service.Content = req.Content
	service.Cover = req.Cover
	service.Consultant = req.Consultant
	service.Price = req.Price
	service.Duration = req.Duration
	service.Status = req.Status

	database.DB.Save(&service)
	utils.Success(c, service)
}

func DeleteService(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Service{}, id).Error; err != nil {
		utils.Error(c, 500, "删除失败")
		return
	}

	utils.Success(c, nil)
}

func GetServiceCategories(c *gin.Context) {
	var categories []string
	database.DB.Model(&models.Service{}).Distinct("category").Where("category != ''").Pluck("category", &categories)
	utils.Success(c, categories)
}
