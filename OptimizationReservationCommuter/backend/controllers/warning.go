package controllers

import (
	"shuttle-booking/database"
	"shuttle-booking/models"
	"shuttle-booking/utils"

	"github.com/gin-gonic/gin"
)

func GetCapacityWarnings(c *gin.Context) {
	isHandled := c.Query("is_handled")

	var warnings []models.CapacityWarning
	query := database.DB.Preload("Schedule").Preload("Schedule.Route")

	if isHandled != "" {
		query = query.Where("is_handled = ?", isHandled)
	}

	query.Order("warning_time desc").Find(&warnings)
	utils.Success(c, warnings)
}

func HandleWarning(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	var input struct {
		HandleNote string `json:"handle_note"`
	}
	c.ShouldBindJSON(&input)

	var warning models.CapacityWarning
	if err := database.DB.First(&warning, id).Error; err != nil {
		utils.NotFound(c, "预警不存在")
		return
	}

	database.DB.Model(&warning).Updates(map[string]interface{}{
		"is_handled":  1,
		"handle_note": input.HandleNote,
	})

	utils.Success(c, nil)
}

func GetWarningStats(c *gin.Context) {
	var total int64
	var unhandled int64
	var yellow int64
	var red int64

	database.DB.Model(&models.CapacityWarning{}).Count(&total)
	database.DB.Model(&models.CapacityWarning{}).Where("is_handled = 0").Count(&unhandled)
	database.DB.Model(&models.CapacityWarning{}).Where("warning_level = 1").Count(&yellow)
	database.DB.Model(&models.CapacityWarning{}).Where("warning_level = 2").Count(&red)

	utils.Success(c, gin.H{
		"total":     total,
		"unhandled": unhandled,
		"yellow":    yellow,
		"red":       red,
	})
}
