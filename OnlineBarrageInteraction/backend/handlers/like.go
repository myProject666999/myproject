package handlers

import (
	"net/http"
	"strconv"

	"barrage_interaction/models"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

type LikeRequest struct {
	UserID uint `json:"user_id" binding:"required"`
}

func LikeMessage(c *gin.Context) {
	messageID := c.Param("message_id")
	id, err := strconvUint(messageID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid message ID"})
		return
	}

	var req LikeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existingLike models.Like
	result := models.DB.Where("message_id = ? AND user_id = ?", id, req.UserID).First(&existingLike)
	if result.Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already liked this message"})
		return
	}

	like := models.Like{
		MessageID: id,
		UserID:    req.UserID,
	}

	if err := models.DB.Create(&like).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like message"})
		return
	}

	models.DB.Model(&models.Message{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("likes + 1"))

	var message models.Message
	models.DB.Preload("User").First(&message, id)

	c.JSON(http.StatusOK, gin.H{
		"message": "Liked successfully",
		"data":    message,
	})
}

func UnlikeMessage(c *gin.Context) {
	messageID := c.Param("message_id")
	id, err := strconvUint(messageID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid message ID"})
		return
	}

	var req LikeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := models.DB.Where("message_id = ? AND user_id = ?", id, req.UserID).Delete(&models.Like{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike message"})
		return
	}

	if result.RowsAffected > 0 {
		models.DB.Model(&models.Message{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("likes - 1"))
	}

	var message models.Message
	models.DB.Preload("User").First(&message, id)

	c.JSON(http.StatusOK, gin.H{
		"message": "Unliked successfully",
		"data":    message,
	})
}

func strconvUint(s string) (uint, error) {
	var result uint64
	var err error
	result, err = strconv.ParseUint(s, 10, 64)
	if err != nil {
		return 0, err
	}
	return uint(result), nil
}
