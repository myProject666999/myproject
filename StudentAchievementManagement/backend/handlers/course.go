package handlers

import (
	"net/http"
	"student-management/database"
	"student-management/models"

	"github.com/gin-gonic/gin"
)

func GetCourses(c *gin.Context) {
	courseNo := c.Query("courseNo")
	name := c.Query("name")
	
	var courses []models.Course
	query := database.DB
	
	if courseNo != "" {
		query = query.Where("course_no LIKE ?", "%"+courseNo+"%")
	}
	if name != "" {
		query = query.Where("name LIKE ?", "%"+name+"%")
	}
	
	query.Find(&courses)
	c.JSON(http.StatusOK, gin.H{"data": courses})
}

func GetCourse(c *gin.Context) {
	id := c.Param("id")
	var course models.Course
	
	if err := database.DB.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"data": course})
}

func CreateCourse(c *gin.Context) {
	var course models.Course
	
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	var existing models.Course
	if database.DB.Where("course_no = ?", course.CourseNo).First(&existing).Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CourseNo already exists"})
		return
	}
	
	if err := database.DB.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"data": course})
}

func UpdateCourse(c *gin.Context) {
	id := c.Param("id")
	var course models.Course
	
	if err := database.DB.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}
	
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := database.DB.Save(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"data": course})
}

func DeleteCourse(c *gin.Context) {
	id := c.Param("id")
	
	result := database.DB.Delete(&models.Course{}, id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Course deleted successfully"})
}

func BatchDeleteCourses(c *gin.Context) {
	var req BatchDeleteRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No IDs provided"})
		return
	}
	
	result := database.DB.Delete(&models.Course{}, req.IDs)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Courses deleted successfully",
		"count":   result.RowsAffected,
	})
}
