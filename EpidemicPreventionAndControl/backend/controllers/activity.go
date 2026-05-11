package controllers

import (
	"epidemic/config"
	"epidemic/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetActivities(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	title := c.Query("title")

	offset := (page - 1) * pageSize
	query := config.DB.Model(&models.Activity{})

	if title != "" {
		query = query.Where("title LIKE ?", "%"+title+"%")
	}

	var total int64
	query.Count(&total)

	var activities []models.Activity
	query.Offset(offset).Limit(pageSize).Order("id desc").Find(&activities)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": gin.H{
			"list":     activities,
			"total":    total,
			"page":     page,
			"page_size": pageSize,
		},
	})
}

func GetPublicActivities(c *gin.Context) {
	title := c.Query("title")
	query := config.DB.Model(&models.Activity{}).Where("status = ?", 1)

	if title != "" {
		query = query.Where("title LIKE ?", "%"+title+"%")
	}

	var activities []models.Activity
	query.Order("id desc").Find(&activities)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": activities,
	})
}

func GetActivity(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var activity models.Activity
	if err := config.DB.First(&activity, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "活动不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": activity,
	})
}

func CreateActivity(c *gin.Context) {
	var activity models.Activity
	if err := c.ShouldBindJSON(&activity); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "创建成功",
		"data": activity,
	})
}

func UpdateActivity(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var activity models.Activity
	if err := config.DB.First(&activity, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "活动不存在"})
		return
	}

	if err := c.ShouldBindJSON(&activity); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Save(&activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "更新成功",
		"data": activity,
	})
}

func DeleteActivity(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Delete(&models.Activity{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "删除成功",
	})
}
