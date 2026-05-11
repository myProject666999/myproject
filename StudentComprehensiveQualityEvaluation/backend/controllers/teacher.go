package controllers

import (
	"net/http"
	"strconv"

	"student_quality_system/config"
	"student_quality_system/models"

	"github.com/gin-gonic/gin"
)

type PageInfo struct {
	Page     int `form:"page" json:"page"`
	PageSize int `form:"pageSize" json:"pageSize"`
}

func GetTeachers(c *gin.Context) {
	var pageInfo PageInfo
	if err := c.ShouldBindQuery(&pageInfo); err != nil {
		pageInfo.Page = 1
		pageInfo.PageSize = 10
	}
	
	if pageInfo.Page <= 0 {
		pageInfo.Page = 1
	}
	if pageInfo.PageSize <= 0 {
		pageInfo.PageSize = 10
	}
	
	query := config.DB.Model(&models.Teacher{})
	
	if teacherNo := c.Query("teacher_no"); teacherNo != "" {
		query = query.Where("teacher_no LIKE ?", "%"+teacherNo+"%")
	}
	if realName := c.Query("real_name"); realName != "" {
		query = query.Where("real_name LIKE ?", "%"+realName+"%")
	}
	if department := c.Query("department"); department != "" {
		query = query.Where("department LIKE ?", "%"+department+"%")
	}
	
	var total int64
	query.Count(&total)
	
	var teachers []models.Teacher
	query.Offset((pageInfo.Page - 1) * pageInfo.PageSize).Limit(pageInfo.PageSize).Find(&teachers)
	
	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": gin.H{
			"list": teachers,
			"total": total,
			"page": pageInfo.Page,
			"pageSize": pageInfo.PageSize,
		},
	})
}

func GetTeacher(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	var teacher models.Teacher
	if err := config.DB.First(&teacher, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "教师不存在"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "success", "data": teacher})
}

func CreateTeacher(c *gin.Context) {
	var teacher models.Teacher
	if err := c.ShouldBindJSON(&teacher); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	if err := config.DB.Create(&teacher).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": teacher})
}

func UpdateTeacher(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	var teacher models.Teacher
	if err := config.DB.First(&teacher, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "教师不存在"})
		return
	}
	
	if err := c.ShouldBindJSON(&teacher); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	if err := config.DB.Save(&teacher).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": teacher})
}

func DeleteTeacher(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	if err := config.DB.Delete(&models.Teacher{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
