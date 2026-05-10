package handlers

import (
	"net/http"
	"strconv"
	"time"

	"power-team-management/database"
	"power-team-management/models"

	"github.com/gin-gonic/gin"
)

type CreateReportRequest struct {
	ReportDate   time.Time `json:"report_date" binding:"required"`
	Content      string    `json:"content"`
	WorkProgress string    `json:"work_progress"`
	PlanTomorrow string    `json:"plan_tomorrow"`
	Problems     string    `json:"problems"`
}

func GetMyReports(c *gin.Context) {
	userID, _ := c.Get("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	offset := (page - 1) * pageSize

	var reports []models.DailyReport
	var total int64

	query := database.DB.Where("user_id = ?", userID).Order("report_date DESC")

	query.Model(&models.DailyReport{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&reports)

	c.JSON(http.StatusOK, gin.H{
		"data":      reports,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetReportByDate(c *gin.Context) {
	userID, _ := c.Get("user_id")
	dateStr := c.Param("date")

	date, err := time.ParseInLocation("2006-01-02", dateStr, time.Local)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.Local)
	endOfDay := startOfDay.AddDate(0, 0, 1)

	var report models.DailyReport
	err = database.DB.Where("user_id = ? AND report_date >= ? AND report_date < ?", userID, startOfDay, endOfDay).First(&report).Error

	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"id":            0,
			"report_date":   dateStr,
			"content":       "",
			"work_progress": "",
			"plan_tomorrow": "",
			"problems":      "",
		})
		return
	}

	c.JSON(http.StatusOK, report)
}

func CreateReport(c *gin.Context) {
	var req CreateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	var existingReport models.DailyReport
	startOfDay := time.Date(req.ReportDate.Year(), req.ReportDate.Month(), req.ReportDate.Day(), 0, 0, 0, 0, time.Local)
	endOfDay := startOfDay.AddDate(0, 0, 1)

	err := database.DB.Where("user_id = ? AND report_date >= ? AND report_date < ?", userID, startOfDay, endOfDay).First(&existingReport).Error

	if err == nil {
		existingReport.Content = req.Content
		existingReport.WorkProgress = req.WorkProgress
		existingReport.PlanTomorrow = req.PlanTomorrow
		existingReport.Problems = req.Problems

		if err := database.DB.Save(&existingReport).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update report"})
			return
		}

		c.JSON(http.StatusOK, existingReport)
		return
	}

	report := models.DailyReport{
		UserID:       userID.(uint),
		ReportDate:   req.ReportDate,
		Content:      req.Content,
		WorkProgress: req.WorkProgress,
		PlanTomorrow: req.PlanTomorrow,
		Problems:     req.Problems,
	}

	if err := database.DB.Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create report"})
		return
	}

	c.JSON(http.StatusCreated, report)
}

func GetTeamReports(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	dateStr := c.Query("date")
	userIDFilter := c.Query("user_id")

	offset := (page - 1) * pageSize

	var reports []models.DailyReport
	var total int64

	query := database.DB.Preload("User.Role")

	if dateStr != "" {
		date, err := time.Parse("2006-01-02", dateStr)
		if err == nil {
			startOfDay := date
			endOfDay := date.AddDate(0, 0, 1)
			query = query.Where("report_date >= ? AND report_date < ?", startOfDay, endOfDay)
		}
	}

	if userIDFilter != "" {
		query = query.Where("user_id = ?", userIDFilter)
	}

	query.Model(&models.DailyReport{}).Count(&total)
	query.Order("report_date DESC, created_at DESC").Offset(offset).Limit(pageSize).Find(&reports)

	c.JSON(http.StatusOK, gin.H{
		"data":      reports,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetReport(c *gin.Context) {
	id := c.Param("id")

	var report models.DailyReport
	if err := database.DB.Preload("User.Role").First(&report, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	c.JSON(http.StatusOK, report)
}

func UpdateReport(c *gin.Context) {
	id := c.Param("id")

	var req CreateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var report models.DailyReport
	if err := database.DB.First(&report, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	report.Content = req.Content
	report.WorkProgress = req.WorkProgress
	report.PlanTomorrow = req.PlanTomorrow
	report.Problems = req.Problems

	if err := database.DB.Save(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update report"})
		return
	}

	c.JSON(http.StatusOK, report)
}

func DeleteReport(c *gin.Context) {
	id := c.Param("id")

	var report models.DailyReport
	if err := database.DB.First(&report, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	if err := database.DB.Delete(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete report"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Report deleted successfully"})
}
