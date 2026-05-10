package controller

import (
	"community-care/config"
	"community-care/model"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetVisitRecords(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	userID := c.Query("user_id")

	roles, _ := c.Get("roles")
	userRoles, _ := roles.([]string)
	currentUserID, _ := c.Get("user_id")

	offset := (page - 1) * pageSize

	var records []model.VisitRecord
	var total int64

	query := config.DB.Model(&model.VisitRecord{})

	isPatient := false
	isDoctor := false
	for _, r := range userRoles {
		if r == "patient" {
			isPatient = true
		}
		if r == "doctor" {
			isDoctor = true
		}
	}

	if isPatient {
		query = query.Where("user_id = ?", currentUserID)
	} else if isDoctor {
		query = query.Where("doctor_id = ?", currentUserID)
	} else if userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	query.Count(&total)
	query.Preload("User").Preload("Doctor").Offset(offset).Limit(pageSize).Order("visit_date desc").Find(&records)

	c.JSON(http.StatusOK, gin.H{
		"list":     records,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func GetVisitRecord(c *gin.Context) {
	id := c.Param("id")

	var record model.VisitRecord
	if err := config.DB.Preload("User").Preload("Doctor").First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "就诊记录不存在"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func CreateVisitRecord(c *gin.Context) {
	var record model.VisitRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	roles, _ := c.Get("roles")
	userRoles, _ := roles.([]string)
	currentUserID, _ := c.Get("user_id")

	for _, r := range userRoles {
		if r == "doctor" {
			record.DoctorID = currentUserID.(uint)
			break
		}
	}

	if err := config.DB.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建就诊记录失败"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func UpdateVisitRecord(c *gin.Context) {
	id := c.Param("id")

	var record model.VisitRecord
	if err := config.DB.First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "就诊记录不存在"})
		return
	}

	roles, _ := c.Get("roles")
	userRoles, _ := roles.([]string)
	currentUserID, _ := c.Get("user_id")

	isDoctor := false
	for _, r := range userRoles {
		if r == "doctor" {
			isDoctor = true
			break
		}
	}

	if isDoctor && record.DoctorID != currentUserID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权限修改此就诊记录"})
		return
	}

	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Save(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新就诊记录失败"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func DeleteVisitRecord(c *gin.Context) {
	id := c.Param("id")

	var record model.VisitRecord
	if err := config.DB.First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "就诊记录不存在"})
		return
	}

	if err := config.DB.Delete(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除就诊记录失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
