package handlers

import (
	"net/http"
	"time"

	"campus-volunteer-system/config"
	"campus-volunteer-system/models"

	"github.com/gin-gonic/gin"
)

func GetStats(c *gin.Context) {
	now := time.Now()
	
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	todayEnd := todayStart.Add(24 * time.Hour)
	
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	monthEnd := monthStart.AddDate(0, 1, 0)

	var dailyCount int64
	config.DB.Model(&models.Activity{}).
		Where("created_at >= ? AND created_at < ?", todayStart, todayEnd).
		Count(&dailyCount)

	var monthlyCount int64
	config.DB.Model(&models.Activity{}).
		Where("created_at >= ? AND created_at < ?", monthStart, monthEnd).
		Count(&monthlyCount)

	var totalCount int64
	config.DB.Model(&models.Activity{}).Count(&totalCount)

	var volunteerCount int64
	config.DB.Model(&models.User{}).Where("role = ?", models.RoleVolunteer).Count(&volunteerCount)

	var excellentCount int64
	config.DB.Model(&models.User{}).Where("role = ? AND is_excellent = ?", models.RoleVolunteer, true).Count(&excellentCount)

	var pendingActivities int64
	config.DB.Model(&models.Activity{}).Where("status = ?", models.ActivityActive).Count(&pendingActivities)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "获取成功",
		"data": gin.H{
			"daily_activities":       dailyCount,
			"monthly_activities":     monthlyCount,
			"total_activities":       totalCount,
			"total_volunteers":       volunteerCount,
			"excellent_volunteers":   excellentCount,
			"pending_activities":     pendingActivities,
		},
	})
}

func GetMonthlyActivityTrend(c *gin.Context) {
	now := time.Now()
	var monthlyData []struct {
		Month string `json:"month"`
		Count int64  `json:"count"`
	}

	for i := 5; i >= 0; i-- {
		date := now.AddDate(0, -i, 0)
		monthStart := time.Date(date.Year(), date.Month(), 1, 0, 0, 0, 0, date.Location())
		monthEnd := monthStart.AddDate(0, 1, 0)
		
		var count int64
		config.DB.Model(&models.Activity{}).
			Where("created_at >= ? AND created_at < ?", monthStart, monthEnd).
			Count(&count)
		
		monthlyData = append(monthlyData, struct {
			Month string `json:"month"`
			Count int64  `json:"count"`
		}{
			Month: date.Format("2006-01"),
			Count: count,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "获取成功",
		"data":    monthlyData,
	})
}
