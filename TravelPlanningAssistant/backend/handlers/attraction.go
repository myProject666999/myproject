package handlers

import (
	"net/http"
	"travelplanner/database"
	"travelplanner/models"

	"github.com/gin-gonic/gin"
)

func GetAttractions(c *gin.Context) {
	dayID := c.Param("day_id")
	var attractions []models.Attraction
	if err := database.DB.Where("day_id = ?", dayID).Order("order_index ASC").Find(&attractions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": attractions})
}

func GetAttraction(c *gin.Context) {
	id := c.Param("id")
	var attraction models.Attraction
	if err := database.DB.First(&attraction, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Attraction not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": attraction})
}

func CreateAttraction(c *gin.Context) {
	dayID := c.Param("day_id")
	var input struct {
		Name        string  `json:"name" binding:"required"`
		Type        string  `json:"type" binding:"required"`
		Description string  `json:"description"`
		Latitude    float64 `json:"latitude"`
		Longitude   float64 `json:"longitude"`
		Address     string  `json:"address"`
		StartTime   string  `json:"start_time"`
		EndTime     string  `json:"end_time"`
		Cost        float64 `json:"cost"`
		Notes       string  `json:"notes"`
		OrderIndex  int     `json:"order_index"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	attraction := models.Attraction{
		DayID:       parseUint(dayID),
		Name:        input.Name,
		Type:        input.Type,
		Description: input.Description,
		Latitude:    input.Latitude,
		Longitude:   input.Longitude,
		Address:     input.Address,
		StartTime:   input.StartTime,
		EndTime:     input.EndTime,
		Cost:        input.Cost,
		Notes:       input.Notes,
		OrderIndex:  input.OrderIndex,
	}

	if err := database.DB.Create(&attraction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": attraction})
}

func UpdateAttraction(c *gin.Context) {
	id := c.Param("id")
	var attraction models.Attraction
	if err := database.DB.First(&attraction, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Attraction not found"})
		return
	}

	var input struct {
		Name        string  `json:"name"`
		Type        string  `json:"type"`
		Description string  `json:"description"`
		Latitude    float64 `json:"latitude"`
		Longitude   float64 `json:"longitude"`
		Address     string  `json:"address"`
		StartTime   string  `json:"start_time"`
		EndTime     string  `json:"end_time"`
		Cost        float64 `json:"cost"`
		Notes       string  `json:"notes"`
		OrderIndex  int     `json:"order_index"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{
		"name":         input.Name,
		"type":         input.Type,
		"description":  input.Description,
		"latitude":     input.Latitude,
		"longitude":    input.Longitude,
		"address":      input.Address,
		"start_time":   input.StartTime,
		"end_time":     input.EndTime,
		"cost":         input.Cost,
		"notes":        input.Notes,
		"order_index":  input.OrderIndex,
	}

	database.DB.Model(&attraction).Updates(updates)
	database.DB.First(&attraction, id)
	c.JSON(http.StatusOK, gin.H{"data": attraction})
}

func DeleteAttraction(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Attraction{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Attraction deleted successfully"})
}

func GetAllAttractions(c *gin.Context) {
	var attractions []models.Attraction
	if err := database.DB.Order("created_at DESC").Find(&attractions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": attractions})
}
