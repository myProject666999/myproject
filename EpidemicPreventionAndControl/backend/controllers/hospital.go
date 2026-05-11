package controllers

import (
	"epidemic/config"
	"epidemic/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetHospitals(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	name := c.Query("name")
	level := c.Query("level")
	status := c.Query("status")

	offset := (page - 1) * pageSize
	query := config.DB.Model(&models.Hospital{})

	if name != "" {
		query = query.Where("name LIKE ?", "%"+name+"%")
	}
	if level != "" {
		query = query.Where("level = ?", level)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	var hospitals []models.Hospital
	query.Offset(offset).Limit(pageSize).Order("id desc").Find(&hospitals)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": gin.H{
			"list":     hospitals,
			"total":    total,
			"page":     page,
			"page_size": pageSize,
		},
	})
}

func GetHospital(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var hospital models.Hospital
	if err := config.DB.First(&hospital, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "医院不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": hospital,
	})
}

func CreateHospital(c *gin.Context) {
	var hospital models.Hospital
	if err := c.ShouldBindJSON(&hospital); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&hospital).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "创建成功",
		"data": hospital,
	})
}

func UpdateHospital(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var hospital models.Hospital
	if err := config.DB.First(&hospital, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "医院不存在"})
		return
	}

	if err := c.ShouldBindJSON(&hospital); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Save(&hospital).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "更新成功",
		"data": hospital,
	})
}

func DeleteHospital(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Delete(&models.Hospital{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "删除成功",
	})
}
