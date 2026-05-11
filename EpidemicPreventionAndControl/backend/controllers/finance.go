package controllers

import (
	"epidemic/config"
	"epidemic/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetFinances(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	offset := (page - 1) * pageSize
	query := config.DB.Model(&models.Finance{})

	if startDate != "" && endDate != "" {
		query = query.Where("receive_date >= ? AND receive_date <= ?", startDate, endDate)
	}

	var total int64
	query.Count(&total)

	var finances []models.Finance
	query.Offset(offset).Limit(pageSize).Order("id desc").Find(&finances)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": gin.H{
			"list":     finances,
			"total":    total,
			"page":     page,
			"page_size": pageSize,
		},
	})
}

func GetFinanceStats(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := config.DB.Model(&models.Finance{})

	if startDate != "" && endDate != "" {
		query = query.Where("receive_date >= ? AND receive_date <= ?", startDate, endDate)
	}

	var totalIncome, totalExpense float64
	query.Where("type = ?", "收入").Select("COALESCE(SUM(amount), 0)").Scan(&totalIncome)
	query.Where("type = ?", "支出").Select("COALESCE(SUM(amount), 0)").Scan(&totalExpense)

	type DailyStat struct {
		Date   string  `json:"date"`
		Income float64 `json:"income"`
		Expense float64 `json:"expense"`
	}

	var dailyStats []DailyStat

	rawQuery := `
		SELECT 
			receive_date as date,
			COALESCE(SUM(CASE WHEN type = '收入' THEN amount ELSE 0 END), 0) as income,
			COALESCE(SUM(CASE WHEN type = '支出' THEN amount ELSE 0 END), 0) as expense
		FROM finances
		WHERE deleted_at IS NULL
	`
	if startDate != "" && endDate != "" {
		rawQuery += ` AND receive_date >= '` + startDate + `' AND receive_date <= '` + endDate + `'`
	}
	rawQuery += ` GROUP BY receive_date ORDER BY receive_date ASC`

	config.DB.Raw(rawQuery).Scan(&dailyStats)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": gin.H{
			"total_income":  totalIncome,
			"total_expense": totalExpense,
			"net_income":    totalIncome - totalExpense,
			"daily_stats":   dailyStats,
		},
	})
}

func CreateFinance(c *gin.Context) {
	var finance models.Finance
	if err := c.ShouldBindJSON(&finance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&finance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "创建成功",
		"data": finance,
	})
}

func UpdateFinance(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var finance models.Finance
	if err := config.DB.First(&finance, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "记录不存在"})
		return
	}

	if err := c.ShouldBindJSON(&finance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Save(&finance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "更新成功",
		"data": finance,
	})
}

func DeleteFinance(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Delete(&models.Finance{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "删除成功",
	})
}
