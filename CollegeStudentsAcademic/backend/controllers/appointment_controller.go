package controllers

import (
	"college-academic/database"
	"college-academic/models"
	"college-academic/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CreateAppointment(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		ServiceID       uint   `json:"service_id" binding:"required"`
		AppointmentDate string `json:"appointment_date" binding:"required"`
		AppointmentTime string `json:"appointment_time" binding:"required"`
		ContactPhone    string `json:"contact_phone"`
		Remark          string `json:"remark"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	var service models.Service
	if err := database.DB.First(&service, req.ServiceID).Error; err != nil {
		utils.Error(c, 404, "服务不存在")
		return
	}

	appointment := models.Appointment{
		StudentID:       userID,
		ServiceID:       req.ServiceID,
		AppointmentDate: req.AppointmentDate,
		AppointmentTime: req.AppointmentTime,
		ContactPhone:    req.ContactPhone,
		Remark:          req.Remark,
		Status:          0,
	}

	if err := database.DB.Create(&appointment).Error; err != nil {
		utils.Error(c, 500, "预约失败")
		return
	}

	utils.Success(c, appointment)
}

func GetStudentAppointments(c *gin.Context) {
	userID := c.GetUint("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")
	keyword := c.Query("keyword")

	var appointments []models.Appointment
	var total int64

	query := database.DB.Model(&models.Appointment{}).Where("student_id = ?", userID).Preload("Service")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&appointments)

	if keyword != "" {
		var filtered []models.Appointment
		for _, a := range appointments {
			if contains(a.Service.Title, keyword) || contains(a.Remark, keyword) {
				filtered = append(filtered, a)
			}
		}
		utils.SuccessPage(c, filtered, int64(len(filtered)), page, pageSize)
		return
	}

	utils.SuccessPage(c, appointments, total, page, pageSize)
}

func contains(s, substr string) bool {
	return len(substr) == 0 || (len(s) > 0 && len(s) >= len(substr) && (s == substr || len(s) > 0))
}

func GetAllAppointments(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	var appointments []models.Appointment
	var total int64

	query := database.DB.Model(&models.Appointment{}).Preload("Student").Preload("Service")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&appointments)

	utils.SuccessPage(c, appointments, total, page, pageSize)
}

func GetAppointmentDetail(c *gin.Context) {
	id := c.Param("id")

	var appointment models.Appointment
	if err := database.DB.Preload("Student").Preload("Service").First(&appointment, id).Error; err != nil {
		utils.Error(c, 404, "预约不存在")
		return
	}

	utils.Success(c, appointment)
}

func UpdateAppointment(c *gin.Context) {
	id := c.Param("id")

	var appointment models.Appointment
	if err := database.DB.First(&appointment, id).Error; err != nil {
		utils.Error(c, 404, "预约不存在")
		return
	}

	var req struct {
		AppointmentDate string `json:"appointment_date"`
		AppointmentTime string `json:"appointment_time"`
		ContactPhone    string `json:"contact_phone"`
		Remark          string `json:"remark"`
		Status          int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	if req.AppointmentDate != "" {
		appointment.AppointmentDate = req.AppointmentDate
	}
	if req.AppointmentTime != "" {
		appointment.AppointmentTime = req.AppointmentTime
	}
	if req.ContactPhone != "" {
		appointment.ContactPhone = req.ContactPhone
	}
	if req.Remark != "" {
		appointment.Remark = req.Remark
	}
	appointment.Status = req.Status

	database.DB.Save(&appointment)
	utils.Success(c, appointment)
}

func DeleteAppointment(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Appointment{}, id).Error; err != nil {
		utils.Error(c, 500, "删除失败")
		return
	}

	utils.Success(c, nil)
}
