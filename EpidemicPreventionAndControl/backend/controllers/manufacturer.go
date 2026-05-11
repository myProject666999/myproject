package controllers

import (
	"epidemic/config"
	"epidemic/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetManufacturers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	name := c.Query("name")

	offset := (page - 1) * pageSize
	query := config.DB.Model(&models.Manufacturer{})

	if name != "" {
		query = query.Where("name LIKE ?", "%"+name+"%")
	}

	var total int64
	query.Count(&total)

	var manufacturers []models.Manufacturer
	query.Offset(offset).Limit(pageSize).Order("id desc").Find(&manufacturers)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": gin.H{
			"list":     manufacturers,
			"total":    total,
			"page":     page,
			"page_size": pageSize,
		},
	})
}

func GetManufacturer(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var manufacturer models.Manufacturer
	if err := config.DB.First(&manufacturer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "厂商不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": manufacturer,
	})
}

func CreateManufacturer(c *gin.Context) {
	var manufacturer models.Manufacturer
	if err := c.ShouldBindJSON(&manufacturer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&manufacturer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "创建成功",
		"data": manufacturer,
	})
}

func UpdateManufacturer(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var manufacturer models.Manufacturer
	if err := config.DB.First(&manufacturer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "厂商不存在"})
		return
	}

	if err := c.ShouldBindJSON(&manufacturer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Save(&manufacturer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "更新成功",
		"data": manufacturer,
	})
}

func DeleteManufacturer(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Delete(&models.Manufacturer{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "删除成功",
	})
}
