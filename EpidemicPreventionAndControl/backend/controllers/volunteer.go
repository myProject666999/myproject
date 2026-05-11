package controllers

import (
	"epidemic/config"
	"epidemic/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetVolunteers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	loginName := c.Query("login_name")
	name := c.Query("name")

	offset := (page - 1) * pageSize
	query := config.DB.Model(&models.Volunteer{})

	if loginName != "" {
		query = query.Where("login_name LIKE ?", "%"+loginName+"%")
	}
	if name != "" {
		query = query.Where("name LIKE ?", "%"+name+"%")
	}

	var total int64
	query.Count(&total)

	var volunteers []models.Volunteer
	query.Offset(offset).Limit(pageSize).Order("id desc").Find(&volunteers)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": gin.H{
			"list":     volunteers,
			"total":    total,
			"page":     page,
			"page_size": pageSize,
		},
	})
}

func GetVolunteer(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var volunteer models.Volunteer
	if err := config.DB.First(&volunteer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "志愿者不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": volunteer,
	})
}

func CreateVolunteer(c *gin.Context) {
	var volunteer models.Volunteer
	if err := c.ShouldBindJSON(&volunteer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := volunteer.SetPassword("123456"); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "密码加密失败"})
		return
	}

	if err := config.DB.Create(&volunteer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "创建成功",
		"data": volunteer,
	})
}

func UpdateVolunteer(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var volunteer models.Volunteer
	if err := config.DB.First(&volunteer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "志愿者不存在"})
		return
	}

	if err := c.ShouldBindJSON(&volunteer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Save(&volunteer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "更新成功",
		"data": volunteer,
	})
}

func DeleteVolunteer(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Delete(&models.Volunteer{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "删除成功",
	})
}
