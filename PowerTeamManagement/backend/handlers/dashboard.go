package handlers

import (
	"net/http"
	"time"

	"power-team-management/database"
	"power-team-management/models"

	"github.com/gin-gonic/gin"
)

func GetDashboardStats(c *gin.Context) {
	userID, _ := c.Get("user_id")
	roleCode, _ := c.Get("role_code")

	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, 0)

	var totalOpportunities int64
	var completedOpportunities int64
	var totalAmount float64
	var completedAmount float64

	baseQuery := database.DB.Model(&models.Opportunity{}).
		Where("created_at >= ? AND created_at < ?", startOfMonth, endOfMonth)

	if roleCode.(string) != "admin" {
		baseQuery = baseQuery.Where("assigned_to_id = ? OR created_by_id = ?", userID, userID)
	}

	baseQuery.Count(&totalOpportunities)

	completedQuery := database.DB.Model(&models.Opportunity{}).
		Where("created_at >= ? AND created_at < ?", startOfMonth, endOfMonth).
		Where("status = ?", models.StatusCompleted)

	if roleCode.(string) != "admin" {
		completedQuery = completedQuery.Where("assigned_to_id = ? OR created_by_id = ?", userID, userID)
	}

	completedQuery.Count(&completedOpportunities)

	amountQuery := database.DB.Model(&models.Opportunity{}).
		Where("created_at >= ? AND created_at < ?", startOfMonth, endOfMonth).
		Select("COALESCE(SUM(amount), 0)")

	if roleCode.(string) != "admin" {
		amountQuery = amountQuery.Where("assigned_to_id = ? OR created_by_id = ?", userID, userID)
	}

	amountQuery.Row().Scan(&totalAmount)

	completedAmountQuery := database.DB.Model(&models.Opportunity{}).
		Where("created_at >= ? AND created_at < ?", startOfMonth, endOfMonth).
		Where("status = ?", models.StatusCompleted).
		Select("COALESCE(SUM(amount), 0)")

	if roleCode.(string) != "admin" {
		completedAmountQuery = completedAmountQuery.Where("assigned_to_id = ? OR created_by_id = ?", userID, userID)
	}

	completedAmountQuery.Row().Scan(&completedAmount)

	conversionRate := 0.0
	if totalOpportunities > 0 {
		conversionRate = float64(completedOpportunities) / float64(totalOpportunities) * 100
	}

	c.JSON(http.StatusOK, gin.H{
		"total_opportunities":     totalOpportunities,
		"completed_opportunities": completedOpportunities,
		"total_amount":            totalAmount,
		"completed_amount":        completedAmount,
		"conversion_rate":         conversionRate,
	})
}

func GetOpportunitiesByStatus(c *gin.Context) {
	userID, _ := c.Get("user_id")
	roleCode, _ := c.Get("role_code")

	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, 0)

	statuses := []models.OpportunityStatus{
		models.StatusNew,
		models.StatusInitial,
		models.StatusRequirement,
		models.StatusNegotiation,
		models.StatusCommercial,
		models.StatusCompleted,
	}

	statusLabels := map[models.OpportunityStatus]string{
		models.StatusNew:         "新机会",
		models.StatusInitial:     "初步接触中",
		models.StatusRequirement: "需求分析中",
		models.StatusNegotiation: "协商方案中",
		models.StatusCommercial:  "商业谈判中",
		models.StatusCompleted:   "已完成",
	}

	result := make([]map[string]interface{}, 0)

	for _, status := range statuses {
		query := database.DB.Model(&models.Opportunity{}).
			Where("status = ?", status).
			Where("created_at >= ? AND created_at < ?", startOfMonth, endOfMonth)

		if roleCode.(string) != "admin" {
			query = query.Where("assigned_to_id = ? OR created_by_id = ?", userID, userID)
		}

		var count int64
		query.Count(&count)

		result = append(result, map[string]interface{}{
			"status": status,
			"label":  statusLabels[status],
			"count":  count,
		})
	}

	c.JSON(http.StatusOK, result)
}

func GetConversionStats(c *gin.Context) {
	userID, _ := c.Get("user_id")
	roleCode, _ := c.Get("role_code")

	now := time.Now()

	months := make([]map[string]interface{}, 0)

	for i := 5; i >= 0; i-- {
		monthStart := time.Date(now.Year(), now.Month()-time.Month(i), 1, 0, 0, 0, 0, now.Location())
		monthEnd := monthStart.AddDate(0, 1, 0)
		monthLabel := monthStart.Format("2006-01")

		var total int64
		var completed int64

		baseQuery := database.DB.Model(&models.Opportunity{}).
			Where("created_at >= ? AND created_at < ?", monthStart, monthEnd)

		if roleCode.(string) != "admin" {
			baseQuery = baseQuery.Where("assigned_to_id = ? OR created_by_id = ?", userID, userID)
		}

		baseQuery.Count(&total)

		completedQuery := database.DB.Model(&models.Opportunity{}).
			Where("status = ?", models.StatusCompleted).
			Where("updated_at >= ? AND updated_at < ?", monthStart, monthEnd)

		if roleCode.(string) != "admin" {
			completedQuery = completedQuery.Where("assigned_to_id = ? OR created_by_id = ?", userID, userID)
		}

		completedQuery.Count(&completed)

		conversionRate := 0.0
		if total > 0 {
			conversionRate = float64(completed) / float64(total) * 100
		}

		months = append(months, map[string]interface{}{
			"month":           monthLabel,
			"total":           total,
			"completed":       completed,
			"conversion_rate": conversionRate,
		})
	}

	c.JSON(http.StatusOK, months)
}

func GetUpcomingDeadlines(c *gin.Context) {
	userID, _ := c.Get("user_id")
	roleCode, _ := c.Get("role_code")

	now := time.Now()
	nextWeek := now.AddDate(0, 0, 14)

	query := database.DB.Preload("Customer").Preload("AssignedTo").
		Where("expected_close >= ? AND expected_close <= ?", now, nextWeek).
		Where("status NOT IN ?", []models.OpportunityStatus{models.StatusCompleted, models.StatusLost}).
		Order("expected_close ASC")

	if roleCode.(string) != "admin" {
		query = query.Where("assigned_to_id = ? OR created_by_id = ?", userID, userID)
	}

	var opportunities []models.Opportunity
	query.Find(&opportunities)

	c.JSON(http.StatusOK, opportunities)
}
