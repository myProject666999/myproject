package controllers

import (
	"shuttle-booking/database"
	"shuttle-booking/models"
	"shuttle-booking/utils"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func VerifyQRCode(c *gin.Context) {
	var input struct {
		QRToken    string `json:"qr_token" binding:"required"`
		StationID  int    `json:"station_id" binding:"required"`
		EmployeeID int    `json:"employee_id"`
		DeviceInfo string `json:"device_info"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	tx := database.DB.Begin()

	var reservation models.Reservation
	result := tx.Where("qr_token = ?", input.QRToken).First(&reservation)
	if result.Error != nil {
		tx.Rollback()
		createVerifyRecord(tx, 0, input.EmployeeID, 0, input.StationID, 1, 0, "二维码无效", input.DeviceInfo)
		tx.Commit()
		utils.BadRequest(c, "二维码无效")
		return
	}

	if time.Now().After(reservation.QRExpireTime) {
		tx.Rollback()
		createVerifyRecord(tx, reservation.ID, reservation.EmployeeID, reservation.ScheduleID, input.StationID, 1, 0, "二维码已过期", input.DeviceInfo)
		tx.Commit()
		utils.BadRequest(c, "二维码已过期")
		return
	}

	if reservation.IsVerified == 1 {
		tx.Rollback()
		createVerifyRecord(tx, reservation.ID, reservation.EmployeeID, reservation.ScheduleID, input.StationID, 1, 0, "已核验过，禁止重复核验", input.DeviceInfo)
		tx.Commit()
		utils.BadRequest(c, "已核验过，禁止重复核验")
		return
	}

	if reservation.Status != 1 {
		tx.Rollback()
		createVerifyRecord(tx, reservation.ID, reservation.EmployeeID, reservation.ScheduleID, input.StationID, 1, 0, "预约状态无效", input.DeviceInfo)
		tx.Commit()
		utils.BadRequest(c, "预约状态无效")
		return
	}

	var routeStation models.RouteStation
	if err := tx.Where("route_id = (SELECT route_id FROM schedules WHERE id = ?) AND station_id = ?", reservation.ScheduleID, input.StationID).First(&routeStation).Error; err != nil {
		tx.Rollback()
		createVerifyRecord(tx, reservation.ID, reservation.EmployeeID, reservation.ScheduleID, input.StationID, 1, 0, "不在该班次的站点", input.DeviceInfo)
		tx.Commit()
		utils.BadRequest(c, "不在该班次的站点")
		return
	}

	tx.Model(&reservation).Updates(map[string]interface{}{
		"is_verified":       1,
		"verify_time":       time.Now(),
		"verify_station_id": input.StationID,
	})

	createVerifyRecord(tx, reservation.ID, reservation.EmployeeID, reservation.ScheduleID, input.StationID, 1, 1, "", input.DeviceInfo)

	tx.Commit()

	var employee models.Employee
	database.DB.First(&employee, reservation.EmployeeID)

	utils.Success(c, gin.H{
		"success":     true,
		"employee":    employee,
		"reservation": reservation,
	})
}

func createVerifyRecord(tx *gorm.DB, reservationID, employeeID, scheduleID, stationID, verifyType, verifyResult int, failReason, deviceInfo string) {
	record := models.VerifyRecord{
		ReservationID: reservationID,
		EmployeeID:    employeeID,
		ScheduleID:    scheduleID,
		StationID:     stationID,
		VerifyType:    verifyType,
		VerifyResult:  verifyResult,
		FailReason:    failReason,
		DeviceInfo:    deviceInfo,
		VerifyTime:    time.Now(),
	}
	tx.Create(&record)
}

func GetVerifyRecords(c *gin.Context) {
	scheduleID := c.Query("schedule_id")
	employeeID := c.Query("employee_id")

	var records []models.VerifyRecord
	query := database.DB

	if scheduleID != "" {
		query = query.Where("schedule_id = ?", scheduleID)
	}
	if employeeID != "" {
		query = query.Where("employee_id = ?", employeeID)
	}

	query.Order("verify_time desc").Find(&records)
	utils.Success(c, records)
}
