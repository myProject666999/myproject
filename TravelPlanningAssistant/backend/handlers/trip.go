package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"travelplanner/database"
	"travelplanner/models"

	"github.com/gin-gonic/gin"
)

func generateShareToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func GetTrips(c *gin.Context) {
	var trips []models.Trip
	if err := database.DB.Preload("Days").Preload("Days.Attractions").Preload("Budgets").Find(&trips).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": trips})
}

func GetTrip(c *gin.Context) {
	id := c.Param("id")
	var trip models.Trip
	if err := database.DB.Preload("Days").Preload("Days.Attractions").Preload("Budgets").First(&trip, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": trip})
}

func CreateTrip(c *gin.Context) {
	var input struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		StartDate   string `json:"start_date" binding:"required"`
		EndDate     string `json:"end_date" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	startDate, _ := parseDate(input.StartDate)
	endDate, _ := parseDate(input.EndDate)

	trip := models.Trip{
		Name:        input.Name,
		Description: input.Description,
		StartDate:   startDate,
		EndDate:     endDate,
		Status:      "draft",
		ShareToken:  generateShareToken(),
	}

	if err := database.DB.Create(&trip).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	days := generateDays(trip.ID, startDate, endDate)
	if len(days) > 0 {
		database.DB.Create(&days)
	}

	database.DB.Preload("Days").Preload("Days.Attractions").Preload("Budgets").First(&trip, trip.ID)
	c.JSON(http.StatusCreated, gin.H{"data": trip})
}

func UpdateTrip(c *gin.Context) {
	id := c.Param("id")
	var trip models.Trip
	if err := database.DB.First(&trip, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
		return
	}

	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		StartDate   string `json:"start_date"`
		EndDate     string `json:"end_date"`
		Status      string `json:"status"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if input.Name != "" {
		updates["name"] = input.Name
	}
	if input.Description != "" {
		updates["description"] = input.Description
	}
	if input.StartDate != "" {
		updates["start_date"], _ = parseDate(input.StartDate)
	}
	if input.EndDate != "" {
		updates["end_date"], _ = parseDate(input.EndDate)
	}
	if input.Status != "" {
		updates["status"] = input.Status
	}

	if err := database.DB.Model(&trip).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	database.DB.Preload("Days").Preload("Days.Attractions").Preload("Budgets").First(&trip, id)
	c.JSON(http.StatusOK, gin.H{"data": trip})
}

func DeleteTrip(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Trip{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Trip deleted successfully"})
}
