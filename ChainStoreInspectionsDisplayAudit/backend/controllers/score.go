package controllers

import (
	"chain-store-inspection/database"
	"chain-store-inspection/models"
	"chain-store-inspection/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type ScoreController struct{}

func NewScoreController() *ScoreController {
	return &ScoreController{}
}

func (ctrl *ScoreController) GetRanking(c *gin.Context) {
	periodType := c.DefaultQuery("periodType", "month")
	periodValue := c.Query("periodValue")

	if periodValue == "" {
		now := time.Now()
		if periodType == "month" {
			periodValue = now.Format("2006-01")
		} else if periodType == "week" {
			year, week := now.ISOWeek()
			periodValue = strconv.Itoa(year) + "-W" + strconv.Itoa(week)
		} else if periodType == "quarter" {
			year := now.Year()
			quarter := (int(now.Month())-1)/3 + 1
			periodValue = strconv.Itoa(year) + "-Q" + strconv.Itoa(quarter)
		} else {
			periodValue = strconv.Itoa(now.Year())
		}
	}

	var scores []models.StoreScore
	if err := database.DB.Where("period_type = ? AND period_value = ?", periodType, periodValue).
		Preload("Store").
		Order("rank ASC").
		Find(&scores).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取排名列表失败")
		return
	}

	utils.SuccessResponse(c, gin.H{
		"list":        scores,
		"periodType":  periodType,
		"periodValue": periodValue,
	})
}

func (ctrl *ScoreController) GetStoreScore(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("storeId"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的门店ID")
		return
	}

	periodType := c.DefaultQuery("periodType", "month")
	periodValue := c.Query("periodValue")

	if periodValue == "" {
		now := time.Now()
		if periodType == "month" {
			periodValue = now.Format("2006-01")
		} else if periodType == "week" {
			year, week := now.ISOWeek()
			periodValue = strconv.Itoa(year) + "-W" + strconv.Itoa(week)
		} else if periodType == "quarter" {
			year := now.Year()
			quarter := (int(now.Month())-1)/3 + 1
			periodValue = strconv.Itoa(year) + "-Q" + strconv.Itoa(quarter)
		} else {
			periodValue = strconv.Itoa(now.Year())
		}
	}

	var score models.StoreScore
	if err := database.DB.Where("store_id = ? AND period_type = ? AND period_value = ?", storeID, periodType, periodValue).
		Preload("Store").
		First(&score).Error; err != nil {
		utils.NotFoundResponse(c, "门店得分数据不存在")
		return
	}

	var tasks []models.InspectionTask
	if err := database.DB.Where("store_id = ? AND status = 'completed'", storeID).
		Preload("Template").
		Preload("Inspector").
		Order("end_time DESC").
		Limit(10).
		Find(&tasks).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取任务列表失败")
		return
	}

	utils.SuccessResponse(c, gin.H{
		"score": score,
		"tasks": tasks,
	})
}

func (ctrl *ScoreController) GetTrend(c *gin.Context) {
	storeIDStr := c.Query("storeId")
	periodType := c.DefaultQuery("periodType", "month")

	if storeIDStr == "" {
		utils.BadRequestResponse(c, "门店ID不能为空")
		return
	}

	storeID, err := strconv.ParseUint(storeIDStr, 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的门店ID")
		return
	}

	var scores []models.StoreScore
	query := database.DB.Where("store_id = ? AND period_type = ?", storeID, periodType)

	if periodType == "month" {
		query = query.Order("period_value DESC").Limit(12)
	} else if periodType == "week" {
		query = query.Order("period_value DESC").Limit(12)
	} else if periodType == "quarter" {
		query = query.Order("period_value DESC").Limit(8)
	} else {
		query = query.Order("period_value DESC").Limit(5)
	}

	if err := query.Find(&scores).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取趋势数据失败")
		return
	}

	for i, j := 0, len(scores)-1; i < j; i, j = i+1, j-1 {
		scores[i], scores[j] = scores[j], scores[i]
	}

	utils.SuccessResponse(c, scores)
}

func (ctrl *ScoreController) AggregateScores(c *gin.Context) {
	var req struct {
		PeriodType  string `json:"periodType" binding:"required"`
		PeriodValue string `json:"periodValue" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	var stores []models.Store
	if err := database.DB.Where("status = 1").Find(&stores).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取门店列表失败")
		return
	}

	for _, store := range stores {
		var tasks []models.InspectionTask
		taskQuery := database.DB.Where("store_id = ? AND status = 'completed'", store.ID)

		if req.PeriodType == "month" {
			startDate := req.PeriodValue + "-01"
			endDate := req.PeriodValue + "-31"
			taskQuery = taskQuery.Where("DATE(end_time) BETWEEN ? AND ?", startDate, endDate)
		} else if req.PeriodType == "year" {
			startDate := req.PeriodValue + "-01-01"
			endDate := req.PeriodValue + "-12-31"
			taskQuery = taskQuery.Where("DATE(end_time) BETWEEN ? AND ?", startDate, endDate)
		}

		if err := taskQuery.Preload("Template").Find(&tasks).Error; err != nil {
			continue
		}

		taskCount := len(tasks)
		completedCount := taskCount
		totalScore := 0.0
		passCount := 0

		for _, task := range tasks {
			totalScore += float64(task.ActualScore)
			if task.IsPass == 1 {
				passCount++
			}
		}

		avgScore := 0.0
		passRate := 0.0
		if completedCount > 0 {
			avgScore = totalScore / float64(completedCount)
			passRate = float64(passCount) / float64(completedCount) * 100
		}

		var issueCount int64
		issueQuery := database.DB.Model(&models.Issue{}).Where("store_id = ?", store.ID)
		if req.PeriodType == "month" {
			startDate := req.PeriodValue + "-01 00:00:00"
			endDate := req.PeriodValue + "-31 23:59:59"
			issueQuery = issueQuery.Where("discover_time BETWEEN ? AND ?", startDate, endDate)
		} else if req.PeriodType == "year" {
			startDate := req.PeriodValue + "-01-01 00:00:00"
			endDate := req.PeriodValue + "-12-31 23:59:59"
			issueQuery = issueQuery.Where("discover_time BETWEEN ? AND ?", startDate, endDate)
		}
		issueQuery.Count(&issueCount)

		var rectifiedCount int64
		rectifiedQuery := database.DB.Model(&models.Issue{}).Where("store_id = ? AND is_rectified = 1", store.ID)
		if req.PeriodType == "month" {
			startDate := req.PeriodValue + "-01 00:00:00"
			endDate := req.PeriodValue + "-31 23:59:59"
			rectifiedQuery = rectifiedQuery.Where("actual_resolve_time BETWEEN ? AND ?", startDate, endDate)
		} else if req.PeriodType == "year" {
			startDate := req.PeriodValue + "-01-01 00:00:00"
			endDate := req.PeriodValue + "-12-31 23:59:59"
			rectifiedQuery = rectifiedQuery.Where("actual_resolve_time BETWEEN ? AND ?", startDate, endDate)
		}
		rectifiedQuery.Count(&rectifiedCount)

		rectificationRate := 0.0
		if issueCount > 0 {
			rectificationRate = float64(rectifiedCount) / float64(issueCount) * 100
		}

		var existingScore models.StoreScore
		err := database.DB.Where("store_id = ? AND period_type = ? AND period_value = ?",
			store.ID, req.PeriodType, req.PeriodValue).First(&existingScore).Error

		score := models.StoreScore{
			StoreID:           store.ID,
			PeriodType:        req.PeriodType,
			PeriodValue:       req.PeriodValue,
			TaskCount:         taskCount,
			CompletedCount:    completedCount,
			TotalScore:        totalScore,
			AvgScore:          avgScore,
			PassRate:          passRate,
			IssueCount:        int(issueCount),
			RectifiedCount:    int(rectifiedCount),
			RectificationRate: rectificationRate,
		}

		if err != nil {
			database.DB.Create(&score)
		} else {
			existingScore.TaskCount = taskCount
			existingScore.CompletedCount = completedCount
			existingScore.TotalScore = totalScore
			existingScore.AvgScore = avgScore
			existingScore.PassRate = passRate
			existingScore.IssueCount = int(issueCount)
			existingScore.RectifiedCount = int(rectifiedCount)
			existingScore.RectificationRate = rectificationRate
			existingScore.LastRank = existingScore.Rank
			database.DB.Save(&existingScore)
		}
	}

	var allScores []models.StoreScore
	database.DB.Where("period_type = ? AND period_value = ?", req.PeriodType, req.PeriodValue).
		Order("avg_score DESC, pass_rate DESC").
		Find(&allScores)

	for i, score := range allScores {
		rank := i + 1
		rankChange := 0
		if score.LastRank > 0 {
			rankChange = score.LastRank - rank
		}
		database.DB.Model(&score).Updates(map[string]interface{}{
			"rank":        rank,
			"rank_change": rankChange,
		})
	}

	utils.SuccessResponse(c, gin.H{
		"periodType":  req.PeriodType,
		"periodValue": req.PeriodValue,
		"storeCount":  len(stores),
		"message":     "聚合计算完成",
	})
}
