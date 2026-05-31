package handlers

import (
	"net/http"
	"travelplanner/database"
	"travelplanner/models"

	"github.com/gin-gonic/gin"
)

func GetDays(c *gin.Context) {
	tripID := c.Param("trip_id")
	var days []models.Day
	if err := database.DB.Where("trip_id = ?", tripID).Preload("Attractions").Order("order_index ASC").Find(&days).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": days})
}

func CreateDay(c *gin.Context) {
	tripID := c.Param("trip_id")
	var input struct {
		Date       string `json:"date" binding:"required"`
		OrderIndex int    `json:"order_index"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	date, _ := parseDate(input.Date)

	day := models.Day{
		TripID:     parseUint(tripID),
		Date:       date,
		OrderIndex: input.OrderIndex,
	}

	if err := database.DB.Create(&day).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	database.DB.Preload("Attractions").First(&day, day.ID)
	c.JSON(http.StatusCreated, gin.H{"data": day})
}

func UpdateDay(c *gin.Context) {
	id := c.Param("id")
	var day models.Day
	if err := database.DB.First(&day, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Day not found"})
		return
	}

	var input struct {
		Date       string `json:"date"`
		OrderIndex int    `json:"order_index"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if input.Date != "" {
		updates["date"], _ = parseDate(input.Date)
	}
	updates["order_index"] = input.OrderIndex

	database.DB.Model(&day).Updates(updates)
	database.DB.Preload("Attractions").First(&day, id)
	c.JSON(http.StatusOK, gin.H{"data": day})
}

func DeleteDay(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Day{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Day deleted successfully"})
}
