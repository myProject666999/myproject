package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"script-management/config"
	"script-management/models"
	"script-management/utils"
)

func GetCarousels(c *gin.Context) {
	var carousels []models.Carousel
	config.DB.Where("status = 1").Order("sort ASC").Find(&carousels)
	utils.Success(c, carousels)
}

func GetAllCarousels(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var carousels []models.Carousel
	var total int64

	config.DB.Model(&models.Carousel{}).Count(&total)
	offset := (page - 1) * pageSize
	config.DB.Offset(offset).Limit(pageSize).Order("sort ASC, id DESC").Find(&carousels)

	utils.Success(c, gin.H{
		"list":      carousels,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func CreateCarousel(c *gin.Context) {
	var req struct {
		Title  string `json:"title"`
		Image  string `json:"image" binding:"required"`
		Link   string `json:"link"`
		Sort   int    `json:"sort"`
		Status int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	carousel := models.Carousel{
		Title:  req.Title,
		Image:  req.Image,
		Link:   req.Link,
		Sort:   req.Sort,
		Status: req.Status,
	}

	if err := config.DB.Create(&carousel).Error; err != nil {
		utils.InternalError(c, "创建失败")
		return
	}

	utils.Success(c, carousel)
}

func GetCarousel(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	var carousel models.Carousel
	if err := config.DB.First(&carousel, id).Error; err != nil {
		utils.NotFound(c, "轮播图不存在")
		return
	}

	utils.Success(c, carousel)
}

func UpdateCarousel(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	var carousel models.Carousel
	if err := config.DB.First(&carousel, id).Error; err != nil {
		utils.NotFound(c, "轮播图不存在")
		return
	}

	var req map[string]interface{}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if v, exists := req["title"]; exists && v != nil {
		carousel.Title = v.(string)
	}
	if v, exists := req["image"]; exists && v != nil {
		carousel.Image = v.(string)
	}
	if v, exists := req["link"]; exists && v != nil {
		carousel.Link = v.(string)
	}
	if v, exists := req["sort"]; exists && v != nil {
		switch val := v.(type) {
		case float64:
			carousel.Sort = int(val)
		case int:
			carousel.Sort = val
		}
	}
	if v, exists := req["status"]; exists && v != nil {
		switch val := v.(type) {
		case float64:
			carousel.Status = int(val)
		case int:
			carousel.Status = val
		case bool:
			if val {
				carousel.Status = 1
			} else {
				carousel.Status = 0
			}
		}
	}

	if err := config.DB.Save(&carousel).Error; err != nil {
		utils.InternalError(c, "更新失败")
		return
	}

	utils.Success(c, carousel)
}

func DeleteCarousel(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	if err := config.DB.Delete(&models.Carousel{}, id).Error; err != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}
