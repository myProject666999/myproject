package controllers

import (
	"net/http"
	"strconv"

	"student_quality_system/config"
	"student_quality_system/models"

	"github.com/gin-gonic/gin"
)

func GetGrades(c *gin.Context) {
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
	
	query := config.DB.Model(&models.Grade{})
	
	if studentNo := c.Query("student_no"); studentNo != "" {
		query = query.Where("student_no LIKE ?", "%"+studentNo+"%")
	}
	if studentName := c.Query("student_name"); studentName != "" {
		query = query.Where("student_name LIKE ?", "%"+studentName+"%")
	}
	if courseName := c.Query("course_name"); courseName != "" {
		query = query.Where("course_name LIKE ?", "%"+courseName+"%")
	}
	if semester := c.Query("semester"); semester != "" {
		query = query.Where("semester = ?", semester)
	}
	
	role, _ := c.Get("role")
	if role == "student" {
		userID, _ := c.Get("user_id")
		var student models.Student
		config.DB.Where("user_id = ?", userID).First(&student)
		if student.ID > 0 {
			query = query.Where("student_id = ?", student.ID)
		}
	}
	
	var total int64
	query.Count(&total)
	
	var grades []models.Grade
	query.Offset((pageInfo.Page - 1) * pageInfo.PageSize).Limit(pageInfo.PageSize).Find(&grades)
	
	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": gin.H{
			"list": grades,
			"total": total,
			"page": pageInfo.Page,
			"pageSize": pageInfo.PageSize,
		},
	})
}

func GetGrade(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	var grade models.Grade
	if err := config.DB.First(&grade, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "成绩不存在"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "success", "data": grade})
}

func CreateGrade(c *gin.Context) {
	var grade models.Grade
	if err := c.ShouldBindJSON(&grade); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	if err := config.DB.Create(&grade).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": grade})
}

func UpdateGrade(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	var grade models.Grade
	if err := config.DB.First(&grade, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "成绩不存在"})
		return
	}
	
	if err := c.ShouldBindJSON(&grade); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	if err := config.DB.Save(&grade).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": grade})
}

func DeleteGrade(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	if err := config.DB.Delete(&models.Grade{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
