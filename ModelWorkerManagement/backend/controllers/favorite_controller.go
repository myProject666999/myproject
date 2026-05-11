package controllers

import (
	"model-worker-management/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetFavorites(c *gin.Context) {
	userID := c.GetUint("user_id")
	targetType := c.Query("type")

	var favorites []models.Favorite
	query := models.DB.Where("user_id = ?", userID)
	if targetType != "" {
		query = query.Where("target_type = ?", targetType)
	}
	query.Find(&favorites)

	c.JSON(http.StatusOK, favorites)
}

func AddFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")
	username := c.GetString("username")

	var req struct {
		TargetID   uint   `json:"target_id" binding:"required"`
		TargetType string `json:"target_type" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existing models.Favorite
	if result := models.DB.Where("user_id = ? AND target_id = ? AND target_type = ?", userID, req.TargetID, req.TargetType).First(&existing); result.RowsAffected > 0 {
		c.JSON(http.StatusOK, gin.H{"message": "Already favorited", "favorite": existing})
		return
	}

	favorite := models.Favorite{
		UserID:     userID,
		TargetID:   req.TargetID,
		TargetType: req.TargetType,
	}

	if result := models.DB.Create(&favorite); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Favorite added successfully", "favorite": favorite, "username": username})
}

func RemoveFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var favorite models.Favorite
	if result := models.DB.Where("id = ? AND user_id = ?", id, userID).First(&favorite); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Favorite not found"})
		return
	}

	models.DB.Delete(&favorite)
	c.JSON(http.StatusOK, gin.H{"message": "Favorite removed successfully"})
}

func GetComments(c *gin.Context) {
	targetID := c.Query("target_id")
	targetType := c.Query("target_type")

	var comments []models.Comment
	query := models.DB
	if targetID != "" {
		query = query.Where("target_id = ?", targetID)
	}
	if targetType != "" {
		query = query.Where("target_type = ?", targetType)
	}
	query.Order("created_at DESC").Find(&comments)

	c.JSON(http.StatusOK, comments)
}

func AddComment(c *gin.Context) {
	userID := c.GetUint("user_id")
	username := c.GetString("username")

	var req struct {
		TargetID   uint   `json:"target_id" binding:"required"`
		TargetType string `json:"target_type" binding:"required"`
		Content    string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment := models.Comment{
		UserID:     userID,
		Username:   username,
		TargetID:   req.TargetID,
		TargetType: req.TargetType,
		Content:    req.Content,
	}

	if result := models.DB.Create(&comment); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Comment added successfully", "comment": comment})
}

func DeleteComment(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var comment models.Comment
	if result := models.DB.First(&comment, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	if comment.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own comments"})
		return
	}

	models.DB.Delete(&comment)
	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}
