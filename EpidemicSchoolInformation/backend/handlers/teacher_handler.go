package handlers

import (
	"net/http"

	"github.com/epidemic-system/database"
	"github.com/epidemic-system/models"
	"github.com/gin-gonic/gin"
)

func GetTeachers(c *gin.Context) {
	var teachers []models.Teacher
	query := database.DB
	if keyword := c.Query("keyword"); keyword != "" {
		query = query.Where("name LIKE ? OR teacher_id LIKE ? OR department LIKE ? OR position LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	query.Find(&teachers)
	c.JSON(http.StatusOK, teachers)
}

func GetTeacher(c *gin.Context) {
	id := c.Param("id")
	var teacher models.Teacher
	if err := database.DB.First(&teacher, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	}
	c.JSON(http.StatusOK, teacher)
}

func CreateTeacher(c *gin.Context) {
	var teacher models.Teacher
	if err := c.ShouldBindJSON(&teacher); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Create(&teacher)
	c.JSON(http.StatusCreated, teacher)
}

func UpdateTeacher(c *gin.Context) {
	id := c.Param("id")
	var teacher models.Teacher
	if err := database.DB.First(&teacher, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	}
	if err := c.ShouldBindJSON(&teacher); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Save(&teacher)
	c.JSON(http.StatusOK, teacher)
}

func DeleteTeacher(c *gin.Context) {
	id := c.Param("id")
	var teacher models.Teacher
	if err := database.DB.First(&teacher, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Teacher not found"})
		return
	}
	database.DB.Delete(&teacher)
	c.JSON(http.StatusOK, gin.H{"message": "Teacher deleted successfully", "id": id})
}

func SearchTeachers(c *gin.Context) {
	keyword := c.Query("keyword")
	if keyword == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Keyword is required"})
		return
	}
	var teachers []models.Teacher
	database.DB.Where("name LIKE ? OR teacher_id LIKE ? OR department LIKE ? OR position LIKE ? OR phone LIKE ?", 
		"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%").Find(&teachers)
	c.JSON(http.StatusOK, teachers)
}
