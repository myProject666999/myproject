package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"portfolio/database"
	"portfolio/models"
)

func GetAbout(c *gin.Context) {
	var about models.About
	if err := database.DB.First(&about).Error; err != nil {
		c.JSON(http.StatusOK, models.About{})
		return
	}
	c.JSON(http.StatusOK, about)
}

func UpdateAbout(c *gin.Context) {
	var about models.About
	database.DB.FirstOrCreate(&about, models.About{ID: 1})

	if err := c.ShouldBindJSON(&about); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Save(&about).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, about)
}
