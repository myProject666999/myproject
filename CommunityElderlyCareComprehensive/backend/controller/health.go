package controller

import (
	"community-care/config"
	"community-care/model"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetHealthRecords(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	userID := c.Query("user_id")

	roles, _ := c.Get("roles")
	userRoles, _ := roles.([]string)
	currentUserID, _ := c.Get("user_id")

	offset := (page - 1) * pageSize

	var records []model.HealthRecord
	var total int64

	query := config.DB.Model(&model.HealthRecord{})

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
	query.Preload("User").Offset(offset).Limit(pageSize).Order("record_time desc").Find(&records)

	c.JSON(http.StatusOK, gin.H{
		"list":     records,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func GetHealthRecord(c *gin.Context) {
	id := c.Param("id")

	var record model.HealthRecord
	if err := config.DB.Preload("User").First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "健康记录不存在"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func CreateHealthRecord(c *gin.Context) {
	var record model.HealthRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建健康记录失败"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func UpdateHealthRecord(c *gin.Context) {
	id := c.Param("id")

	var record model.HealthRecord
	if err := config.DB.First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "健康记录不存在"})
		return
	}

	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Save(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新健康记录失败"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func DeleteHealthRecord(c *gin.Context) {
	id := c.Param("id")

	var record model.HealthRecord
	if err := config.DB.First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "健康记录不存在"})
		return
	}

	if err := config.DB.Delete(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除健康记录失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
