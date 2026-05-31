package handlers

import (
	"net/http"
	"travelplanner/database"
	"travelplanner/models"

	"github.com/gin-gonic/gin"
)

func GetSharedTrip(c *gin.Context) {
	token := c.Param("token")
	var trip models.Trip
	if err := database.DB.Where("share_token = ?", token).Preload("Days").Preload("Days.Attractions").Preload("Budgets").First(&trip).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": trip})
}

func GenerateShareLink(c *gin.Context) {
	id := c.Param("id")
	var trip models.Trip
	if err := database.DB.First(&trip, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
		return
	}

	if trip.ShareToken == "" {
		trip.ShareToken = generateShareToken()
		database.DB.Save(&trip)
	}

	shareURL := "/share/" + trip.ShareToken
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"share_url":   shareURL,
			"share_token": trip.ShareToken,
		},
	})
}

func GetTripMapData(c *gin.Context) {
	id := c.Param("id")
	var trip models.Trip
	if err := database.DB.Preload("Days").Preload("Days.Attractions").First(&trip, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trip not found"})
		return
	}

	type MapPoint struct {
		DayID       uint    `json:"day_id"`
		Date        string  `json:"date"`
		DayIndex    int     `json:"day_index"`
		AttractionID uint   `json:"attraction_id"`
		Name        string  `json:"name"`
		Type        string  `json:"type"`
		Latitude    float64 `json:"latitude"`
		Longitude   float64 `json:"longitude"`
		StartTime   string  `json:"start_time"`
		EndTime     string  `json:"end_time"`
		Cost        float64 `json:"cost"`
		Address     string  `json:"address"`
	}

	var points []MapPoint
	for _, day := range trip.Days {
		for _, attr := range day.Attractions {
			points = append(points, MapPoint{
				DayID:        day.ID,
				Date:         day.Date.Format("2006-01-02"),
				DayIndex:     day.OrderIndex,
				AttractionID: attr.ID,
				Name:         attr.Name,
				Type:         attr.Type,
				Latitude:     attr.Latitude,
				Longitude:    attr.Longitude,
				StartTime:    attr.StartTime,
				EndTime:      attr.EndTime,
				Cost:         attr.Cost,
				Address:      attr.Address,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": points})
}
