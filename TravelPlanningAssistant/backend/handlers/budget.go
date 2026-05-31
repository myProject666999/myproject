package handlers

import (
	"net/http"
	"travelplanner/database"
	"travelplanner/models"

	"github.com/gin-gonic/gin"
)

func GetBudgets(c *gin.Context) {
	tripID := c.Param("trip_id")
	var budgets []models.Budget
	if err := database.DB.Where("trip_id = ?", tripID).Find(&budgets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": budgets})
}

func CreateBudget(c *gin.Context) {
	tripID := c.Param("trip_id")
	var input struct {
		Category string  `json:"category" binding:"required"`
		Amount   float64 `json:"amount" binding:"required"`
		Notes    string  `json:"notes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	budget := models.Budget{
		TripID:   parseUint(tripID),
		Category: input.Category,
		Amount:   input.Amount,
		Notes:    input.Notes,
	}

	if err := database.DB.Create(&budget).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": budget})
}

func UpdateBudget(c *gin.Context) {
	id := c.Param("id")
	var budget models.Budget
	if err := database.DB.First(&budget, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Budget not found"})
		return
	}

	var input struct {
		Category string  `json:"category"`
		Amount   float64 `json:"amount"`
		Notes    string  `json:"notes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{
		"category": input.Category,
		"amount":   input.Amount,
		"notes":    input.Notes,
	}

	database.DB.Model(&budget).Updates(updates)
	database.DB.First(&budget, id)
	c.JSON(http.StatusOK, gin.H{"data": budget})
}

func DeleteBudget(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Budget{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Budget deleted successfully"})
}

func GetBudgetSummary(c *gin.Context) {
	tripID := c.Param("trip_id")

	var budgets []models.Budget
	database.DB.Where("trip_id = ?", tripID).Find(&budgets)

	total := 0.0
	categoryTotals := make(map[string]float64)

	for _, b := range budgets {
		total += b.Amount
		categoryTotals[b.Category] += b.Amount
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"total":          total,
			"categoryTotals": categoryTotals,
			"budgets":        budgets,
		},
	})
}
