package handlers

import (
	"time"

	"vehicle-parking/backend/models"
	"vehicle-parking/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DashboardHandler struct {
	DB *gorm.DB
}

func NewDashboardHandler(db *gorm.DB) *DashboardHandler {
	return &DashboardHandler{DB: db}
}

func (h *DashboardHandler) Overview(c *gin.Context) {
	var result struct {
		TotalVehicles      int64   `json:"total_vehicles"`
		MonthlyVehicles    int64   `json:"monthly_vehicles"`
		TempVehicles       int64   `json:"temp_vehicles"`
		TotalSpots         int64   `json:"total_spots"`
		FreeSpots          int64   `json:"free_spots"`
		OccupiedSpots      int64   `json:"occupied_spots"`
		TodayEntries       int64   `json:"today_entries"`
		TodayExits         int64   `json:"today_exits"`
		TodayRevenue       float64 `json:"today_revenue"`
		CurrentInside      int64   `json:"current_inside"`
		TotalMonthlyCards  int64   `json:"total_monthly_cards"`
		ActiveMonthlyCards int64   `json:"active_monthly_cards"`
	}

	h.DB.Model(&models.Vehicle{}).Count(&result.TotalVehicles)
	h.DB.Model(&models.Vehicle{}).Where("card_type = 2").Count(&result.MonthlyVehicles)
	h.DB.Model(&models.Vehicle{}).Where("card_type = 1").Count(&result.TempVehicles)

	h.DB.Model(&models.ParkingSpot{}).Count(&result.TotalSpots)
	h.DB.Model(&models.ParkingSpot{}).Where("status = 0").Count(&result.FreeSpots)
	h.DB.Model(&models.ParkingSpot{}).Where("status = 1").Count(&result.OccupiedSpots)

	today := time.Now().Format("2006-01-02")
	h.DB.Model(&models.AccessRecord{}).
		Where("access_type = 1 AND DATE(access_time) = ?", today).
		Count(&result.TodayEntries)

	h.DB.Model(&models.AccessRecord{}).
		Where("access_type = 2 AND DATE(access_time) = ?", today).
		Count(&result.TodayExits)

	h.DB.Model(&models.AccessRecord{}).
		Where("access_type = 2 AND pay_status = 1 AND DATE(access_time) = ?", today).
		Select("COALESCE(SUM(parking_fee), 0)").
		Scan(&result.TodayRevenue)

	h.DB.Raw(`
		SELECT COUNT(*) FROM (
			SELECT DISTINCT plate_number FROM access_records 
			WHERE access_type = 1 AND parking_duration = 0
		) t
	`).Scan(&result.CurrentInside)

	h.DB.Model(&models.MonthlyCard{}).Count(&result.TotalMonthlyCards)
	h.DB.Model(&models.MonthlyCard{}).Where("status = 1").Count(&result.ActiveMonthlyCards)

	utils.Success(c, result)
}

func (h *DashboardHandler) RecentRecords(c *gin.Context) {
	var records []models.AccessRecord
	h.DB.Order("access_time DESC").Limit(10).Find(&records)

	utils.Success(c, records)
}

func (h *DashboardHandler) MonthlyCardsExpiring(c *gin.Context) {
	nextMonth := time.Now().AddDate(0, 1, 0)

	var cards []models.MonthlyCard
	h.DB.Where("status = 1 AND end_date <= ?", nextMonth).
		Order("end_date ASC").
		Limit(10).
		Find(&cards)

	utils.Success(c, cards)
}

func (h *DashboardHandler) SpotUsageRate(c *gin.Context) {
	var result struct {
		Total    int64 `json:"total"`
		Occupied int64 `json:"occupied"`
		Rate     float64 `json:"rate"`
	}

	h.DB.Model(&models.ParkingSpot{}).Count(&result.Total)
	h.DB.Model(&models.ParkingSpot{}).Where("status = 1").Count(&result.Occupied)

	if result.Total > 0 {
		result.Rate = float64(result.Occupied) / float64(result.Total) * 100
	}

	utils.Success(c, result)
}
