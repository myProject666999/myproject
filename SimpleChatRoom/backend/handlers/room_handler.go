package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"simple-chat-room/models"
)

type CreateRoomRequest struct {
	Name            string `json:"name" binding:"required"`
	CreatorNickname string `json:"creator_nickname" binding:"required"`
	ExpiresInHours  *int   `json:"expires_in_hours,omitempty"`
}

func ListRooms(c *gin.Context) {
	rooms, err := models.GetActiveRooms()
	if err != nil {
		log.Printf("Failed to fetch rooms: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch rooms", "detail": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": rooms,
	})
}

func CreateRoom(c *gin.Context) {
	var req CreateRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	room, err := models.CreateRoom(req.Name, req.CreatorNickname, req.ExpiresInHours)
	if err != nil {
		log.Printf("Failed to create room: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create room"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": room,
	})
}

func DestroyRoom(c *gin.Context) {
	id := c.Param("id")

	_, err := models.GetRoomByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Room not found"})
		return
	}

	if err := models.DestroyRoom(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to destroy room"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "Room destroyed successfully",
	})
}
