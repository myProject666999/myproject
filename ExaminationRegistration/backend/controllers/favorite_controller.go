package controllers

import (
	"strconv"

	"examination-registration/database"
	"examination-registration/models"
	"examination-registration/utils"

	"github.com/gin-gonic/gin"
)

func AddFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		TargetType string `json:"target_type" binding:"required"`
		TargetID   uint   `json:"target_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var existing models.Favorite
	result := database.DB.Where("user_id = ? AND target_type = ? AND target_id = ?",
		userID, req.TargetType, req.TargetID).First(&existing)

	if result.RowsAffected > 0 {
		utils.BadRequest(c, "已收藏")
		return
	}

	favorite := models.Favorite{
		UserID:     userID,
		TargetType: req.TargetType,
		TargetID:   req.TargetID,
	}

	database.DB.Create(&favorite)
	utils.SuccessWithMessage(c, "收藏成功", nil)
}

func RemoveFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Favorite{}); result.Error != nil {
		utils.InternalError(c, "取消收藏失败")
		return
	}

	utils.SuccessWithMessage(c, "取消收藏成功", nil)
}

func GetFavoriteList(c *gin.Context) {
	userID := c.GetUint("user_id")
	targetType := c.Query("target_type")

	var favorites []models.Favorite
	query := database.DB.Where("user_id = ?", userID)
	if targetType != "" {
		query = query.Where("target_type = ?", targetType)
	}
	query.Order("id DESC").Find(&favorites)

	utils.Success(c, favorites)
}

func CheckFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")
	targetType := c.Query("target_type")
	targetID, _ := strconv.ParseUint(c.Query("target_id"), 10, 32)

	var favorite models.Favorite
	result := database.DB.Where("user_id = ? AND target_type = ? AND target_id = ?",
		userID, targetType, targetID).First(&favorite)

	utils.Success(c, gin.H{
		"is_favorite": result.RowsAffected > 0,
	})
}
