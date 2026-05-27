package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"portfolio/database"
	"portfolio/models"
)

func GetSkills(c *gin.Context) {
	category := c.Query("category")

	db := database.DB.Model(&models.Skill{})

	if category != "" {
		db = db.Where("category = ?", category)
	}

	var skills []models.Skill
	db.Order("sort_order ASC, name ASC").Find(&skills)
	c.JSON(http.StatusOK, skills)
}

func CreateSkill(c *gin.Context) {
	var skill models.Skill
	if err := c.ShouldBindJSON(&skill); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&skill).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, skill)
}

func UpdateSkill(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var skill models.Skill
	if err := database.DB.First(&skill, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Skill not found"})
		return
	}

	if err := c.ShouldBindJSON(&skill); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Save(&skill).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, skill)
}

func DeleteSkill(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := database.DB.Delete(&models.Skill{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Skill deleted successfully"})
}
