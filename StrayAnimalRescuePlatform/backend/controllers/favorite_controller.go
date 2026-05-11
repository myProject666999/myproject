package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"strayanimalrescueplatform/config"
	"strayanimalrescueplatform/models"
	"strayanimalrescueplatform/utils"
)

func GetFavorites(c *gin.Context) {
	userID := c.GetUint("user_id")
	favoriteType := c.Query("type")

	db := config.GetDB()
	query := db.Where("user_id = ?", userID)

	if favoriteType != "" {
		query = query.Where("type = ?", favoriteType)
	}

	var favorites []models.Favorite
	query.Order("created_at DESC").Find(&favorites)

	utils.Success(c, favorites)
}

func AddFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")

	var favorite models.Favorite
	if err := c.ShouldBindJSON(&favorite); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	favorite.UserID = userID

	db := config.GetDB()
	var existing models.Favorite
	if db.Where("user_id = ? AND type = ? AND target_id = ?", userID, favorite.Type, favorite.TargetID).First(&existing).RecordNotFound() {
		if err := db.Create(&favorite).Error; err != nil {
			utils.InternalServerError(c, "收藏失败")
			return
		}
		utils.SuccessWithMessage(c, "收藏成功", nil)
	} else {
		utils.SuccessWithMessage(c, "已收藏", nil)
	}
}

func RemoveFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	db := config.GetDB()
	if err := db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Favorite{}).Error; err != nil {
		utils.InternalServerError(c, "取消收藏失败")
		return
	}

	utils.SuccessWithMessage(c, "取消收藏成功", nil)
}

func CheckFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")
	favoriteType := c.Query("type")
	targetID, _ := strconv.Atoi(c.Query("target_id"))

	db := config.GetDB()
	var count int
	db.Model(&models.Favorite{}).Where("user_id = ? AND type = ? AND target_id = ?", userID, favoriteType, targetID).Count(&count)

	utils.Success(c, gin.H{
		"is_favorite": count > 0,
	})
}
