package controllers

import (
	"fmt"
	"shuttle-booking/database"
	"shuttle-booking/models"
	"shuttle-booking/utils"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetReservations(c *gin.Context) {
	employeeID := c.Query("employee_id")
	scheduleID := c.Query("schedule_id")
	status := c.Query("status")

	var reservations []models.Reservation
	query := database.DB.Preload("Employee").Preload("Schedule").Preload("Schedule.Route").Preload("BoardStation")

	if employeeID != "" {
		query = query.Where("employee_id = ?", employeeID)
	}
	if scheduleID != "" {
		query = query.Where("schedule_id = ?", scheduleID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Order("created_at desc").Find(&reservations)
	utils.Success(c, reservations)
}

func GetReservation(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	var reservation models.Reservation
	if err := database.DB.Preload("Employee").Preload("Schedule").Preload("Schedule.Route").Preload("Schedule.Shuttle").Preload("BoardStation").First(&reservation, id).Error; err != nil {
		utils.NotFound(c, "预约不存在")
		return
	}
	utils.Success(c, reservation)
}

func CreateReservation(c *gin.Context) {
	var input struct {
		EmployeeID     int `json:"employee_id" binding:"required"`
		ScheduleID     int `json:"schedule_id" binding:"required"`
		BoardStationID int `json:"board_station_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	deadlineStr, _ := utils.GetSystemConfig("booking_deadline_minutes")
	deadline := utils.ParseInt(deadlineStr, 60)

	var schedule models.Schedule
	if err := database.DB.First(&schedule, input.ScheduleID).Error; err != nil {
		utils.NotFound(c, "班次不存在")
		return
	}

	departureDatetime := fmt.Sprintf("%s %s", schedule.DepartureDate, schedule.DepartureTime)
	departureTime, _ := time.ParseInLocation("2006-01-02 15:04:05", departureDatetime, time.Local)
	if time.Now().Add(time.Duration(deadline) * time.Minute).After(departureTime) {
		utils.BadRequest(c, "已超过预约截止时间")
		return
	}

	var count int64
	database.DB.Model(&models.Reservation{}).Where("employee_id = ? AND schedule_id = ? AND status IN (1, 2)", input.EmployeeID, input.ScheduleID).Count(&count)
	if count > 0 {
		utils.BadRequest(c, "您已预约该班次")
		return
	}

	tx := database.DB.Begin()

	result := tx.Model(&models.Schedule{}).Where("id = ? AND booked_seats < capacity", input.ScheduleID).UpdateColumn("booked_seats", gorm.Expr("booked_seats + 1"))
	if result.Error != nil {
		tx.Rollback()
		utils.InternalError(c, "预约失败")
		return
	}
	if result.RowsAffected == 0 {
		tx.Rollback()
		utils.BadRequest(c, "该班次已满员")
		return
	}

	var updatedSchedule models.Schedule
	tx.First(&updatedSchedule, input.ScheduleID)

	yellowThreshold, _ := utils.GetSystemConfig("capacity_warning_yellow")
	redThreshold, _ := utils.GetSystemConfig("capacity_warning_red")
	ratio := float64(updatedSchedule.BookedSeats) / float64(updatedSchedule.Capacity)

	if ratio >= utils.ParseFloat(redThreshold, 0.9) || ratio >= utils.ParseFloat(yellowThreshold, 0.8) {
		warningLevel := 1
		if ratio >= utils.ParseFloat(redThreshold, 0.9) {
			warningLevel = 2
			tx.Model(&models.Schedule{}).Where("id = ?", input.ScheduleID).Update("status", 2)
		}

		var warningCount int64
		tx.Model(&models.CapacityWarning{}).Where("schedule_id = ? AND warning_level = ? AND is_handled = 0", input.ScheduleID, warningLevel).Count(&warningCount)
		if warningCount == 0 {
			warning := models.CapacityWarning{
				ScheduleID:    input.ScheduleID,
				WarningLevel:  warningLevel,
				CurrentBooked: updatedSchedule.BookedSeats,
				Capacity:      updatedSchedule.Capacity,
			}
			tx.Create(&warning)
		}
	}

	reservation := models.Reservation{
		ReservationNo:  utils.GenerateNo("RES"),
		EmployeeID:     input.EmployeeID,
		ScheduleID:     input.ScheduleID,
		BoardStationID: input.BoardStationID,
		Status:         1,
	}

	if err := tx.Create(&reservation).Error; err != nil {
		tx.Rollback()
		utils.InternalError(c, "创建预约失败")
		return
	}

	tx.Commit()
	utils.Success(c, reservation)
}

func CancelReservation(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	var reason struct {
		CancelReason string `json:"cancel_reason"`
	}
	c.ShouldBindJSON(&reason)

	tx := database.DB.Begin()

	var reservation models.Reservation
	if err := tx.First(&reservation, id).Error; err != nil {
		tx.Rollback()
		utils.NotFound(c, "预约不存在")
		return
	}

	if reservation.Status != 1 {
		tx.Rollback()
		utils.BadRequest(c, "该预约状态不允许取消")
		return
	}

	if err := tx.Model(&reservation).Updates(map[string]interface{}{
		"status":        3,
		"cancel_reason": reason.CancelReason,
	}).Error; err != nil {
		tx.Rollback()
		utils.InternalError(c, "取消预约失败")
		return
	}

	tx.Model(&models.Schedule{}).Where("id = ?", reservation.ScheduleID).UpdateColumn("booked_seats", gorm.Expr("booked_seats - 1"))

	tx.Commit()
	utils.Success(c, nil)
}

func RebookReservation(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	var input struct {
		NewScheduleID  int `json:"new_schedule_id" binding:"required"`
		BoardStationID int `json:"board_station_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	rebookLimitStr, _ := utils.GetSystemConfig("rebooking_limit")
	rebookLimit := utils.ParseInt(rebookLimitStr, 1)

	tx := database.DB.Begin()

	var oldReservation models.Reservation
	if err := tx.First(&oldReservation, id).Error; err != nil {
		tx.Rollback()
		utils.NotFound(c, "原预约不存在")
		return
	}

	today := time.Now().Format("2006-01-02")
	var rebookCount int64
	tx.Model(&models.Reservation{}).Where("employee_id = ? AND DATE(created_at) = ? AND status = 2", oldReservation.EmployeeID, today).Count(&rebookCount)
	if int(rebookCount) >= rebookLimit {
		tx.Rollback()
		utils.BadRequest(c, "今日改签次数已达上限")
		return
	}

	result := tx.Model(&models.Schedule{}).Where("id = ? AND booked_seats < capacity", input.NewScheduleID).UpdateColumn("booked_seats", gorm.Expr("booked_seats + 1"))
	if result.Error != nil {
		tx.Rollback()
		utils.InternalError(c, "改签失败")
		return
	}
	if result.RowsAffected == 0 {
		tx.Rollback()
		utils.BadRequest(c, "新班次已满员")
		return
	}

	tx.Model(&oldReservation).Update("status", 2)

	newReservation := models.Reservation{
		ReservationNo:  utils.GenerateNo("RES"),
		EmployeeID:     oldReservation.EmployeeID,
		ScheduleID:     input.NewScheduleID,
		BoardStationID: input.BoardStationID,
		Status:         1,
	}
	if err := tx.Create(&newReservation).Error; err != nil {
		tx.Rollback()
		utils.InternalError(c, "创建新预约失败")
		return
	}

	tx.Model(&models.Schedule{}).Where("id = ?", oldReservation.ScheduleID).UpdateColumn("booked_seats", gorm.Expr("booked_seats - 1"))

	tx.Commit()
	utils.Success(c, newReservation)
}

func GenerateReservationQR(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)

	var reservation models.Reservation
	if err := database.DB.First(&reservation, id).Error; err != nil {
		utils.NotFound(c, "预约不存在")
		return
	}

	if reservation.Status != 1 {
		utils.BadRequest(c, "预约状态无效")
		return
	}

	qrValidStr, _ := utils.GetSystemConfig("qr_valid_minutes")
	qrValid := utils.ParseInt(qrValidStr, 30)

	qrToken := utils.GenerateQRToken(reservation.ID)
	qrExpireTime := time.Now().Add(time.Duration(qrValid) * time.Minute)

	database.DB.Model(&reservation).Updates(map[string]interface{}{
		"qr_token":      qrToken,
		"qr_expire_time": qrExpireTime,
	})

	utils.Success(c, gin.H{
		"qr_token":      qrToken,
		"qr_expire_time": qrExpireTime,
		"reservation_id": reservation.ID,
	})
}
