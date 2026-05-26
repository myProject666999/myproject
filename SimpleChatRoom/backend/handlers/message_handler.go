package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"simple-chat-room/models"
)

func GetMessages(c *gin.Context) {
	roomID := c.Param("id")

	limitStr := c.DefaultQuery("limit", "100")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 100
	}

	active, err := models.IsRoomActive(roomID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	if !active {
		c.JSON(http.StatusGone, gin.H{"error": "Room is no longer active"})
		return
	}

	messages, err := models.GetMessagesByRoomID(roomID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": messages,
	})
}
