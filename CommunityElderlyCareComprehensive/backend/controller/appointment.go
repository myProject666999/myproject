package controller

import (
	"community-care/config"
	"community-care/model"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetAppointments(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	roles, _ := c.Get("roles")
	userRoles, _ := roles.([]string)
	currentUserID, _ := c.Get("user_id")

	offset := (page - 1) * pageSize

	var appointments []model.Appointment
	var total int64

	query := config.DB.Model(&model.Appointment{})

	isPatient := false
	isDoctor := false
	for _, r := range userRoles {
		if r == "patient" {
			isPatient = true
		}
		if r == "doctor" {
			isDoctor = true
		}
	}

	if isPatient {
		query = query.Where("user_id = ?", currentUserID)
	} else if isDoctor {
		query = query.Where("doctor_id = ?", currentUserID)
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	query.Preload("User").Preload("Doctor").Offset(offset).Limit(pageSize).Order("appointment_time desc").Find(&appointments)

	c.JSON(http.StatusOK, gin.H{
		"list":     appointments,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func GetAppointment(c *gin.Context) {
	id := c.Param("id")

	var appointment model.Appointment
	if err := config.DB.Preload("User").Preload("Doctor").First(&appointment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "预约信息不存在"})
		return
	}

	c.JSON(http.StatusOK, appointment)
}

func CreateAppointment(c *gin.Context) {
	var appointment model.Appointment
	if err := c.ShouldBindJSON(&appointment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	roles, _ := c.Get("roles")
	userRoles, _ := roles.([]string)
	currentUserID, _ := c.Get("user_id")

	for _, r := range userRoles {
		if r == "patient" {
			appointment.UserID = currentUserID.(uint)
			break
		}
	}

	if appointment.Status == "" {
		appointment.Status = "pending"
	}

	if err := config.DB.Create(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建预约失败"})
		return
	}

	c.JSON(http.StatusOK, appointment)
}

func UpdateAppointment(c *gin.Context) {
	id := c.Param("id")

	var appointment model.Appointment
	if err := config.DB.First(&appointment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "预约信息不存在"})
		return
	}

	roles, _ := c.Get("roles")
	userRoles, _ := roles.([]string)
	currentUserID, _ := c.Get("user_id")

	isPatient := false
	for _, r := range userRoles {
		if r == "patient" {
			isPatient = true
			break
		}
	}

	if isPatient && appointment.UserID != currentUserID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权限修改此预约"})
		return
	}

	var updateData model.Appointment
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if updateData.DoctorID != 0 {
		appointment.DoctorID = updateData.DoctorID
	}
	if !updateData.AppointmentTime.IsZero() {
		appointment.AppointmentTime = updateData.AppointmentTime
	}
	if updateData.Location != "" {
		appointment.Location = updateData.Location
	}
	if updateData.Reason != "" {
		appointment.Reason = updateData.Reason
	}
	if updateData.Status != "" {
		appointment.Status = updateData.Status
	}

	if err := config.DB.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新预约失败"})
		return
	}

	c.JSON(http.StatusOK, appointment)
}

func DeleteAppointment(c *gin.Context) {
	id := c.Param("id")

	var appointment model.Appointment
	if err := config.DB.First(&appointment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "预约信息不存在"})
		return
	}

	roles, _ := c.Get("roles")
	userRoles, _ := roles.([]string)
	currentUserID, _ := c.Get("user_id")

	isPatient := false
	for _, r := range userRoles {
		if r == "patient" {
			isPatient = true
			break
		}
	}

	if isPatient && appointment.UserID != currentUserID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权限删除此预约"})
		return
	}

	if err := config.DB.Delete(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除预约失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
