package controllers

import (
	"encoding/json"
	"shuttle-booking/database"
	"shuttle-booking/models"
	"shuttle-booking/utils"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetOptimizationSuggestions(c *gin.Context) {
	status := c.Query("status")
	suggestionType := c.Query("type")

	var suggestions []models.OptimizationSuggestion
	query := database.DB

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if suggestionType != "" {
		query = query.Where("suggestion_type = ?", suggestionType)
	}

	query.Order("created_at desc").Find(&suggestions)
	utils.Success(c, suggestions)
}

func GenerateOptimizationSuggestions(c *gin.Context) {
	tx := database.DB.Begin()

	stationDemandAnalysis(tx)
	routeLoadAnalysis(tx)

	tx.Commit()

	var suggestions []models.OptimizationSuggestion
	database.DB.Where("status = 0").Order("created_at desc").Limit(10).Find(&suggestions)

	utils.Success(c, suggestions)
}

func stationDemandAnalysis(tx *gorm.DB) {
	type StationDemand struct {
		StationID   int    `json:"station_id"`
		StationName string `json:"station_name"`
		TotalCount  int    `json:"total_count"`
		RouteIDs    []int  `json:"route_ids"`
	}

	rows, _ := tx.Table("reservations r").
		Select("r.board_station_id as station_id, s.name as station_name, COUNT(*) as total_count, GROUP_CONCAT(DISTINCT sch.route_id) as route_ids").
		Joins("JOIN schedules sch ON r.schedule_id = sch.id").
		Joins("JOIN stations s ON r.board_station_id = s.id").
		Where("r.created_at >= ?", time.Now().AddDate(0, 0, -7)).
		Where("r.status IN (1, 2, 4)").
		Group("r.board_station_id, s.name").
		Having("COUNT(*) >= 10").
		Order("total_count desc").
		Rows()

	defer rows.Close()
	for rows.Next() {
		var stationID, totalCount int
		var stationName, routeIDsStr string
		rows.Scan(&stationID, &stationName, &totalCount, &routeIDsStr)

		analysisData := map[string]interface{}{
			"station_id":   stationID,
			"station_name": stationName,
			"total_count":  totalCount,
			"period":       "最近7天",
		}
		analysisJSON, _ := json.Marshal(analysisData)

		title := "站点需求建议：" + stationName + "站点需求旺盛"
		content := "根据最近7天数据分析，" + stationName + "站点累计乘车" + string(rune(totalCount)) + "人次，建议考虑增加途经该站点的班次或调整线路。"
		confidence := float64(totalCount) / 50.0 * 100
		if confidence > 100 {
			confidence = 100
		}

		suggestion := models.OptimizationSuggestion{
			SuggestionType:  1,
			Title:           title,
			Content:         content,
			AnalysisData:    models.JSON(analysisJSON),
			ConfidenceScore: confidence,
			Status:          0,
		}
		tx.Create(&suggestion)
	}
}

func routeLoadAnalysis(tx *gorm.DB) {
	type RouteLoad struct {
		RouteID     int     `json:"route_id"`
		RouteName   string  `json:"route_name"`
		AvgLoadRate float64 `json:"avg_load_rate"`
		TotalRides  int     `json:"total_rides"`
	}

	rows, _ := tx.Table("schedules sch").
		Select("sch.route_id, r.name as route_name, AVG(sch.booked_seats / sch.capacity) as avg_load_rate, COUNT(res.id) as total_rides").
		Joins("JOIN routes r ON sch.route_id = r.id").
		Joins("LEFT JOIN reservations res ON sch.id = res.schedule_id AND res.status IN (1, 2, 4)").
		Where("sch.departure_date >= ?", time.Now().AddDate(0, 0, -7)).
		Group("sch.route_id, r.name").
		Having("AVG(sch.booked_seats / sch.capacity) >= 0.7 OR AVG(sch.booked_seats / sch.capacity) <= 0.3").
		Rows()

	defer rows.Close()
	for rows.Next() {
		var routeID, totalRides int
		var routeName string
		var avgLoadRate float64
		rows.Scan(&routeID, &routeName, &avgLoadRate, &totalRides)

		analysisData := map[string]interface{}{
			"route_id":      routeID,
			"route_name":    routeName,
			"avg_load_rate": avgLoadRate,
			"total_rides":   totalRides,
			"period":        "最近7天",
		}
		analysisJSON, _ := json.Marshal(analysisData)

		var suggestionType int
		var title, content string
		confidence := 85.0

		if avgLoadRate >= 0.7 {
			suggestionType = 1
			title = "满载率高建议：" + routeName + "需增加班次"
			content = "根据最近7天数据分析，" + routeName + "平均满载率达到" + string(rune(int(avgLoadRate*100))) + "%，建议在高峰时段增加班次以缓解运力压力。"
			confidence = avgLoadRate * 100
		} else {
			suggestionType = 2
			title = "满载率低建议：" + routeName + "运力过剩"
			content = "根据最近7天数据分析，" + routeName + "平均满载率仅为" + string(rune(int(avgLoadRate*100))) + "%，建议考虑调整线路走向或减少班次以优化资源配置。"
			confidence = (1 - avgLoadRate) * 100
		}

		suggestion := models.OptimizationSuggestion{
			SuggestionType:  suggestionType,
			Title:           title,
			Content:         content,
			AnalysisData:    models.JSON(analysisJSON),
			ConfidenceScore: confidence,
			Status:          0,
		}
		tx.Create(&suggestion)
	}
}

func HandleSuggestion(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	status := utils.ParseInt(c.Query("status"), 1)

	var suggestion models.OptimizationSuggestion
	if err := database.DB.First(&suggestion, id).Error; err != nil {
		utils.NotFound(c, "建议不存在")
		return
	}

	database.DB.Model(&suggestion).Update("status", status)
	utils.Success(c, nil)
}
