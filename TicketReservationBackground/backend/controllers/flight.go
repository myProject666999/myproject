package controllers

import (
	"net/http"
	"time"

	"ticketreservation/database"
	"ticketreservation/models"

	"github.com/gin-gonic/gin"
)

func GetFlights(c *gin.Context) {
	departureCity := c.Query("departure_city")
	arrivalCity := c.Query("arrival_city")
	date := c.Query("date")

	query := database.DB.Model(&models.Flight{}).Where("status = ?", "available")

	if departureCity != "" {
		query = query.Where("departure_city = ?", departureCity)
	}
	if arrivalCity != "" {
		query = query.Where("arrival_city = ?", arrivalCity)
	}
	if date != "" {
		startDate, err := time.Parse("2006-01-02", date)
		if err == nil {
			endDate := startDate.Add(24 * time.Hour)
			query = query.Where("departure_time >= ? AND departure_time < ?", startDate, endDate)
		}
	}

	var flights []models.Flight
	if err := query.Order("departure_time ASC").Find(&flights).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch flights"})
		return
	}

	c.JSON(http.StatusOK, flights)
}

func GetFlight(c *gin.Context) {
	id := c.Param("id")

	var flight models.Flight
	if err := database.DB.First(&flight, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Flight not found"})
		return
	}

	c.JSON(http.StatusOK, flight)
}

func CreateFlight(c *gin.Context) {
	var flight models.Flight
	if err := c.ShouldBindJSON(&flight); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	flight.Status = "available"
	if err := database.DB.Create(&flight).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create flight"})
		return
	}

	c.JSON(http.StatusCreated, flight)
}

func UpdateFlight(c *gin.Context) {
	id := c.Param("id")

	var flight models.Flight
	if err := database.DB.First(&flight, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Flight not found"})
		return
	}

	var input models.Flight
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Model(&flight).Updates(input)
	c.JSON(http.StatusOK, flight)
}

func DeleteFlight(c *gin.Context) {
	id := c.Param("id")

	var flight models.Flight
	if err := database.DB.First(&flight, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Flight not found"})
		return
	}

	if err := database.DB.Delete(&flight).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete flight"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Flight deleted successfully"})
}
