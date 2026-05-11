package controllers

import (
	"net/http"

	"ticketreservation/database"
	"ticketreservation/models"

	"github.com/gin-gonic/gin"
)

func GetComments(c *gin.Context) {
	flightID := c.Query("flight_id")

	query := database.DB.Preload("User").Preload("Flight")

	if flightID != "" {
		query = query.Where("flight_id = ?", flightID)
	} else {
		query = query.Where("type = ? OR flight_id IS NULL", "general")
	}

	var comments []models.Comment
	if err := query.Order("created_at DESC").Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}

	result := make([]map[string]interface{}, len(comments))
	for i, comment := range comments {
		result[i] = map[string]interface{}{
			"id":         comment.ID,
			"content":    comment.Content,
			"type":       comment.Type,
			"rating":     comment.Rating,
			"created_at": comment.CreatedAt,
			"user": map[string]interface{}{
				"id":       comment.User.ID,
				"username": comment.User.Username,
				"name":     comment.User.Name,
			},
		}
		if comment.Flight != nil {
			result[i]["flight"] = map[string]interface{}{
				"id":            comment.Flight.ID,
				"flight_number": comment.Flight.FlightNumber,
			}
		}
	}

	c.JSON(http.StatusOK, result)
}

func GetAllComments(c *gin.Context) {
	var comments []models.Comment
	if err := database.DB.Preload("User").Preload("Flight").Order("created_at DESC").Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}

	result := make([]map[string]interface{}, len(comments))
	for i, comment := range comments {
		result[i] = map[string]interface{}{
			"id":         comment.ID,
			"content":    comment.Content,
			"type":       comment.Type,
			"rating":     comment.Rating,
			"created_at": comment.CreatedAt,
			"user": map[string]interface{}{
				"id":       comment.User.ID,
				"username": comment.User.Username,
				"name":     comment.User.Name,
			},
		}
		if comment.Flight != nil {
			result[i]["flight"] = map[string]interface{}{
				"id":            comment.Flight.ID,
				"flight_number": comment.Flight.FlightNumber,
			}
		}
	}

	c.JSON(http.StatusOK, result)
}

func CreateComment(c *gin.Context) {
	user, _ := c.Get("user")
	u := user.(models.User)

	var input struct {
		Content  string `json:"content" binding:"required"`
		Type     string `json:"type"`
		FlightID *uint  `json:"flight_id"`
		Rating   int    `json:"rating"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment := models.Comment{
		UserID:   u.ID,
		Content:  input.Content,
		Type:     input.Type,
		FlightID: input.FlightID,
		Rating:   input.Rating,
	}

	if comment.Type == "" {
		comment.Type = "general"
	}
	if comment.Rating == 0 {
		comment.Rating = 5
	}

	if err := database.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment"})
		return
	}

	database.DB.Preload("User").First(&comment, comment.ID)
	c.JSON(http.StatusCreated, gin.H{
		"id":         comment.ID,
		"content":    comment.Content,
		"type":       comment.Type,
		"rating":     comment.Rating,
		"created_at": comment.CreatedAt,
		"user": map[string]interface{}{
			"id":       comment.User.ID,
			"username": comment.User.Username,
			"name":     comment.User.Name,
		},
	})
}

func DeleteComment(c *gin.Context) {
	id := c.Param("id")

	var comment models.Comment
	if err := database.DB.First(&comment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	if err := database.DB.Delete(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}
