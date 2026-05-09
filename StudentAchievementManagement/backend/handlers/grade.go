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
	
	exists, err := StudentExists(grade.StudentNo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check student existence"})
		return
	}
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "StudentNo does not exist: " + grade.StudentNo})
		return
	}
	
	exists, err = CourseExists(grade.CourseNo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check course existence"})
		return
	}
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CourseNo does not exist: " + grade.CourseNo})
		return
	}
	
	if err := database.DB.Create(&grade).Error; err != nil {
		if IsForeignKeyError(err) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Student or Course not found"})
			return
		}
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
	
	oldStudentNo := grade.StudentNo
	oldCourseNo := grade.CourseNo
	
	if err := c.ShouldBindJSON(&grade); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if grade.StudentNo != oldStudentNo {
		exists, err := StudentExists(grade.StudentNo)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check student existence"})
			return
		}
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "StudentNo does not exist: " + grade.StudentNo})
			return
		}
	}
	
	if grade.CourseNo != oldCourseNo {
		exists, err := CourseExists(grade.CourseNo)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check course existence"})
			return
		}
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "CourseNo does not exist: " + grade.CourseNo})
			return
		}
	}
	
	if err := database.DB.Save(&grade).Error; err != nil {
		if IsForeignKeyError(err) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Student or Course not found"})
			return
		}
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
