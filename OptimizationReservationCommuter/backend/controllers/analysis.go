package controllers

import (
	"shuttle-booking/database"
	"shuttle-booking/models"
	"shuttle-booking/utils"
	"time"

	"github.com/gin-gonic/gin"
)

func GetOverallStats(c *gin.Context) {
	var totalEmployees int64
	var totalRoutes int64
	var totalSchedules int64
	var totalReservations int64
	var todayReservations int64

	today := time.Now().Format("2006-01-02")

	database.DB.Model(&models.Employee{}).Where("status = 1").Count(&totalEmployees)
	database.DB.Model(&models.Route{}).Where("status = 1").Count(&totalRoutes)
	database.DB.Model(&models.Schedule{}).Count(&totalSchedules)
	database.DB.Model(&models.Reservation{}).Count(&totalReservations)
	database.DB.Model(&models.Reservation{}).Where("DATE(created_at) = ?", today).Count(&todayReservations)

	utils.Success(c, gin.H{
		"total_employees":    totalEmployees,
		"total_routes":       totalRoutes,
		"total_schedules":    totalSchedules,
		"total_reservations": totalReservations,
		"today_reservations": todayReservations,
	})
}

func GetRouteRanking(c *gin.Context) {
	type RouteRanking struct {
		RouteID     int     `json:"route_id"`
		RouteName   string  `json:"route_name"`
		RouteNo     string  `json:"route_no"`
		Direction   int     `json:"direction"`
		TotalCount  int64   `json:"total_count"`
		AvgLoadRate float64 `json:"avg_load_rate"`
	}

	var results []RouteRanking

	database.DB.Table("reservations r").
		Select("sch.route_id, r2.name as route_name, r2.route_no, r2.direction, COUNT(*) as total_count, AVG(sch.booked_seats / sch.capacity) as avg_load_rate").
		Joins("JOIN schedules sch ON r.schedule_id = sch.id").
		Joins("JOIN routes r2 ON sch.route_id = r2.id").
		Where("r.status IN (1, 2, 4)").
		Where("r.created_at >= ?", time.Now().AddDate(0, 0, -30)).
		Group("sch.route_id, r2.name, r2.route_no, r2.direction").
		Order("total_count desc").
		Limit(10).
		Scan(&results)

	utils.Success(c, results)
}

func GetStationRanking(c *gin.Context) {
	type StationRanking struct {
		StationID   int    `json:"station_id"`
		StationName string `json:"station_name"`
		BoardCount  int64  `json:"board_count"`
		ExitCount   int64  `json:"exit_count"`
		TotalCount  int64  `json:"total_count"`
	}

	var results []StationRanking

	database.DB.Table("stations s").
		Select("s.id as station_id, s.name as station_name, "+
			"(SELECT COUNT(*) FROM reservations r WHERE r.board_station_id = s.id AND r.status IN (1,2,4)) as board_count, "+
			"(SELECT COUNT(*) FROM reservations r WHERE r.exit_station_id = s.id AND r.status IN (1,2,4)) as exit_count, "+
			"((SELECT COUNT(*) FROM reservations r WHERE r.board_station_id = s.id AND r.status IN (1,2,4)) + (SELECT COUNT(*) FROM reservations r WHERE r.exit_station_id = s.id AND r.status IN (1,2,4))) as total_count").
		Where("s.status = 1").
		Order("total_count desc").
		Limit(10).
		Scan(&results)

	utils.Success(c, results)
}

func GetDailyTrend(c *gin.Context) {
	days := utils.ParseInt(c.Query("days"), 7)

	type DailyData struct {
		Date         string `json:"date"`
		ReservationCount int64 `json:"reservation_count"`
		VerifyCount  int64 `json:"verify_count"`
	}

	var results []DailyData

	startDate := time.Now().AddDate(0, 0, -days+1).Format("2006-01-02")

	database.DB.Table("system_configs sc").
		Select("DATE(r.created_at) as date, "+
			"COUNT(DISTINCT r.id) as reservation_count, "+
			"COUNT(DISTINCT vr.id) as verify_count").
		Joins("LEFT JOIN reservations r ON DATE(r.created_at) >= ?", startDate).
		Joins("LEFT JOIN verify_records vr ON DATE(vr.created_at) = DATE(r.created_at)").
		Where("DATE(r.created_at) >= ?", startDate).
		Group("DATE(r.created_at)").
		Order("date").
		Scan(&results)

	if len(results) == 0 {
		results = make([]DailyData, 0)
		for i := 0; i < days; i++ {
			date := time.Now().AddDate(0, 0, -days+1+i).Format("2006-01-02")
			results = append(results, DailyData{
				Date:         date,
				ReservationCount: 0,
				VerifyCount:  0,
			})
		}
	}

	utils.Success(c, results)
}

func GetDepartmentStats(c *gin.Context) {
	type DeptStats struct {
		Department  string `json:"department"`
		EmployeeCount int64 `json:"employee_count"`
		RideCount   int64 `json:"ride_count"`
	}

	var results []DeptStats

	database.DB.Table("employees e").
		Select("e.department, "+
			"COUNT(DISTINCT e.id) as employee_count, "+
			"COUNT(DISTINCT r.id) as ride_count").
		Joins("LEFT JOIN reservations r ON r.employee_id = e.id AND r.status IN (1,2,4)").
		Where("e.status = 1").
		Group("e.department").
		Order("ride_count desc").
		Scan(&results)

	utils.Success(c, results)
}

func GetTimeDistribution(c *gin.Context) {
	type TimeSlot struct {
		HourSlot    string `json:"hour_slot"`
		Count       int64  `json:"count"`
		Direction   int    `json:"direction"`
	}

	var results []TimeSlot

	database.DB.Table("schedules sch").
		Select("CONCAT(LPAD(HOUR(sch.departure_time), 2, '0'), ':00-', LPAD(HOUR(sch.departure_time) + 1, 2, '0'), ':00') as hour_slot, "+
			"COUNT(r.id) as count, "+
			"r2.direction").
		Joins("JOIN reservations r ON r.schedule_id = sch.id AND r.status IN (1,2,4)").
		Joins("JOIN routes r2 ON sch.route_id = r2.id").
		Where("r.created_at >= ?", time.Now().AddDate(0, 0, -7)).
		Group("hour_slot, r2.direction").
		Order("hour_slot").
		Scan(&results)

	utils.Success(c, results)
}

func GetVerificationStats(c *gin.Context) {
	var totalVerify int64
	var successVerify int64
	var failVerify int64

	database.DB.Model(&models.VerifyRecord{}).Count(&totalVerify)
	database.DB.Model(&models.VerifyRecord{}).Where("verify_result = 1").Count(&successVerify)
	database.DB.Model(&models.VerifyRecord{}).Where("verify_result = 0").Count(&failVerify)

	successRate := float64(0)
	if totalVerify > 0 {
		successRate = float64(successVerify) / float64(totalVerify) * 100
	}

	utils.Success(c, gin.H{
		"total_verify":   totalVerify,
		"success_verify": successVerify,
		"fail_verify":    failVerify,
		"success_rate":   successRate,
	})
}
