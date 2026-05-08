package handlers

import (
	"net/http"
	"strconv"

	"campus-volunteer-system/config"
	"campus-volunteer-system/models"

	"github.com/gin-gonic/gin"
)

type CreateCarouselRequest struct {
	Title    string `json:"title"`
	ImageURL string `json:"image_url" binding:"required"`
	Link     string `json:"link"`
	Sort     int    `json:"sort"`
}

func GetCarousels(c *gin.Context) {
	var carousels []models.Carousel
	config.DB.Where("status = ?", "active").
		Order("sort asc, created_at desc").
		Find(&carousels)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "获取成功",
		"data":    carousels,
	})
}

func GetAllCarousels(c *gin.Context) {
	var carousels []models.Carousel
	config.DB.Order("sort asc, created_at desc").Find(&carousels)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "获取成功",
		"data":    carousels,
	})
}

func CreateCarousel(c *gin.Context) {
	var req CreateCarouselRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数错误",
		})
		return
	}

	carousel := &models.Carousel{
		Title:    req.Title,
		ImageURL: req.ImageURL,
		Link:     req.Link,
		Sort:     req.Sort,
		Status:   "active",
	}

	if err := config.DB.Create(carousel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建轮播图失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "创建成功",
		"data":    carousel,
	})
}

func UpdateCarousel(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的轮播图ID",
		})
		return
	}

	var req CreateCarouselRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数错误",
		})
		return
	}

	var carousel models.Carousel
	if err := config.DB.First(&carousel, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "轮播图不存在",
		})
		return
	}

	updates := map[string]interface{}{
		"title":    req.Title,
		"image_url": req.ImageURL,
		"link":     req.Link,
		"sort":     req.Sort,
	}

	if err := config.DB.Model(&carousel).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新失败",
		})
		return
	}

	config.DB.First(&carousel, id)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "更新成功",
		"data":    carousel,
	})
}

func DeleteCarousel(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的轮播图ID",
		})
		return
	}

	if err := config.DB.Delete(&models.Carousel{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "删除失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "删除成功",
	})
}

func ToggleCarouselStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的轮播图ID",
		})
		return
	}

	var carousel models.Carousel
	if err := config.DB.First(&carousel, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "轮播图不存在",
		})
		return
	}

	newStatus := "active"
	if carousel.Status == "active" {
		newStatus = "inactive"
	}

	config.DB.Model(&carousel).Update("status", newStatus)

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "状态更新成功",
		"data": gin.H{
			"status": newStatus,
		},
	})
}
