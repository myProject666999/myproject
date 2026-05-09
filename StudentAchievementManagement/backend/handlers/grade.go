package handlers

import (
	"net/http"
	"student-management/database"
	"student-management/models"

	"github.com/gin-gonic/gin"
)

func GetGrades(c *gin.Context) {
	studentNo := c.Query("studentNo")
	courseNo := c.Query("courseNo")
	
	var grades []models.Grade
	query := database.DB
	
	if studentNo != "" {
		query = query.Where("student_no LIKE ?", "%"+studentNo+"%")
	}
	if courseNo != "" {
		query = query.Where("course_no LIKE ?", "%"+courseNo+"%")
	}
	
	query.Find(&grades)
	c.JSON(http.StatusOK, gin.H{"data": grades})
}

func GetGrade(c *gin.Context) {
	id := c.Param("id")
	var grade models.Grade
	
	if err := database.DB.First(&grade, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Grade not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"data": grade})
}

func CreateGrade(c *gin.Context) {
	var grade models.Grade
	
	if err := c.ShouldBindJSON(&grade); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := database.DB.Create(&grade).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"data": grade})
}

func UpdateGrade(c *gin.Context) {
	id := c.Param("id")
	var grade models.Grade
	
	if err := database.DB.First(&grade, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Grade not found"})
		return
	}
	
	if err := c.ShouldBindJSON(&grade); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := database.DB.Save(&grade).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"data": grade})
}

func DeleteGrade(c *gin.Context) {
	id := c.Param("id")
	
	result := database.DB.Delete(&models.Grade{}, id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Grade not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Grade deleted successfully"})
}

func BatchDeleteGrades(c *gin.Context) {
	var req BatchDeleteRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No IDs provided"})
		return
	}
	
	result := database.DB.Delete(&models.Grade{}, req.IDs)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Grades deleted successfully",
		"count":   result.RowsAffected,
	})
}
