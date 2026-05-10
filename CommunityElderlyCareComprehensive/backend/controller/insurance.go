package controller

import (
	"community-care/config"
	"community-care/model"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetInsurances(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	userID := c.Query("user_id")

	roles, _ := c.Get("roles")
	userRoles, _ := roles.([]string)
	currentUserID, _ := c.Get("user_id")

	offset := (page - 1) * pageSize

	var insurances []model.Insurance
	var total int64

	query := config.DB.Model(&model.Insurance{})

	isPatient := false
	for _, r := range userRoles {
		if r == "patient" {
			isPatient = true
			break
		}
	}

	if isPatient {
		query = query.Where("user_id = ?", currentUserID)
	} else if userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	query.Count(&total)
	query.Preload("User").Offset(offset).Limit(pageSize).Order("id desc").Find(&insurances)

	c.JSON(http.StatusOK, gin.H{
		"list":     insurances,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func GetInsurance(c *gin.Context) {
	id := c.Param("id")

	var insurance model.Insurance
	if err := config.DB.Preload("User").First(&insurance, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "医保信息不存在"})
		return
	}

	c.JSON(http.StatusOK, insurance)
}

func CreateInsurance(c *gin.Context) {
	var insurance model.Insurance
	if err := c.ShouldBindJSON(&insurance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&insurance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建医保信息失败"})
		return
	}

	c.JSON(http.StatusOK, insurance)
}

func UpdateInsurance(c *gin.Context) {
	id := c.Param("id")

	var insurance model.Insurance
	if err := config.DB.First(&insurance, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "医保信息不存在"})
		return
	}

	if err := c.ShouldBindJSON(&insurance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Save(&insurance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新医保信息失败"})
		return
	}

	c.JSON(http.StatusOK, insurance)
}

func DeleteInsurance(c *gin.Context) {
	id := c.Param("id")

	var insurance model.Insurance
	if err := config.DB.First(&insurance, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "医保信息不存在"})
		return
	}

	if err := config.DB.Delete(&insurance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除医保信息失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
