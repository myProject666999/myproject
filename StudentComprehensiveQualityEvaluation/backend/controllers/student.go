package controllers

import (
	"net/http"
	"strconv"

	"student_quality_system/config"
	"student_quality_system/models"

	"github.com/gin-gonic/gin"
)

func GetStudents(c *gin.Context) {
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
	
	query := config.DB.Model(&models.Student{})
	
	if studentNo := c.Query("student_no"); studentNo != "" {
		query = query.Where("student_no LIKE ?", "%"+studentNo+"%")
	}
	if realName := c.Query("real_name"); realName != "" {
		query = query.Where("real_name LIKE ?", "%"+realName+"%")
	}
	if className := c.Query("class_name"); className != "" {
		query = query.Where("class_name LIKE ?", "%"+className+"%")
	}
	if grade := c.Query("grade"); grade != "" {
		query = query.Where("grade = ?", grade)
	}
	if major := c.Query("major"); major != "" {
		query = query.Where("major LIKE ?", "%"+major+"%")
	}
	if department := c.Query("department"); department != "" {
		query = query.Where("department LIKE ?", "%"+department+"%")
	}
	
	var total int64
	query.Count(&total)
	
	var students []models.Student
	query.Offset((pageInfo.Page - 1) * pageInfo.PageSize).Limit(pageInfo.PageSize).Find(&students)
	
	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": gin.H{
			"list": students,
			"total": total,
			"page": pageInfo.Page,
			"pageSize": pageInfo.PageSize,
		},
	})
}

func GetStudent(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	var student models.Student
	if err := config.DB.First(&student, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "学生不存在"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "success", "data": student})
}

func CreateStudent(c *gin.Context) {
	var student models.Student
	if err := c.ShouldBindJSON(&student); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	if err := config.DB.Create(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": student})
}

func UpdateStudent(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	var student models.Student
	if err := config.DB.First(&student, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "学生不存在"})
		return
	}
	
	if err := c.ShouldBindJSON(&student); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	if err := config.DB.Save(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": student})
}

func DeleteStudent(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	if err := config.DB.Delete(&models.Student{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
