package controllers

import (
	"college-academic/database"
	"college-academic/models"
	"college-academic/utils"

	"github.com/gin-gonic/gin"
)

func GetHomeData(c *gin.Context) {
	var banners []models.Banner
	var news []models.News
	var services []models.Service
	var knowledge []models.Knowledge

	database.DB.Where("status = 1").Order("sort ASC").Limit(5).Find(&banners)
	database.DB.Order("created_at DESC").Limit(6).Find(&news)
	database.DB.Where("status = 1").Order("created_at DESC").Limit(8).Find(&services)
	database.DB.Where("status = 1").Order("created_at DESC").Limit(6).Find(&knowledge)

	utils.Success(c, gin.H{
		"banners":   banners,
		"news":      news,
		"services":  services,
		"knowledge": knowledge,
	})
}

func GetDashboardStats(c *gin.Context) {
	var studentCount, serviceCount, appointmentCount, messageCount int64
	var pendingStudents, pendingAppointments, pendingMessages int64

	database.DB.Model(&models.Student{}).Count(&studentCount)
	database.DB.Model(&models.Service{}).Count(&serviceCount)
	database.DB.Model(&models.Appointment{}).Count(&appointmentCount)
	database.DB.Model(&models.Message{}).Count(&messageCount)

	database.DB.Model(&models.Student{}).Where("status = 0").Count(&pendingStudents)
	database.DB.Model(&models.Appointment{}).Where("status = 0").Count(&pendingAppointments)
	database.DB.Model(&models.Message{}).Where("status = 0").Count(&pendingMessages)

	utils.Success(c, gin.H{
		"student_count":          studentCount,
		"service_count":          serviceCount,
		"appointment_count":      appointmentCount,
		"message_count":          messageCount,
		"pending_students":       pendingStudents,
		"pending_appointments":   pendingAppointments,
		"pending_messages":       pendingMessages,
	})
}

func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		utils.Error(c, 400, "请选择文件")
		return
	}

	uploadDir := "./uploads/"
	filePath := uploadDir + file.Filename

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		utils.Error(c, 500, "上传失败")
		return
	}

	utils.Success(c, gin.H{
		"url":  filePath,
		"name": file.Filename,
	})
}
