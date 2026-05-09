package controllers

import (
	"college-academic/database"
	"college-academic/models"
	"college-academic/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CreateMessage(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	message := models.Message{
		StudentID: userID,
		Title:     req.Title,
		Content:   req.Content,
		Status:    0,
	}

	if err := database.DB.Create(&message).Error; err != nil {
		utils.Error(c, 500, "留言失败")
		return
	}

	utils.Success(c, message)
}

func GetStudentMessages(c *gin.Context) {
	userID := c.GetUint("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var messages []models.Message
	var total int64

	query := database.DB.Model(&models.Message{}).Where("student_id = ?", userID)
	query.Count(&total)
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&messages)

	utils.SuccessPage(c, messages, total, page, pageSize)
}

func GetAllMessages(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	var messages []models.Message
	var total int64

	query := database.DB.Model(&models.Message{}).Preload("Student")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&messages)

	utils.SuccessPage(c, messages, total, page, pageSize)
}

func GetMessageDetail(c *gin.Context) {
	id := c.Param("id")

	var message models.Message
	if err := database.DB.Preload("Student").First(&message, id).Error; err != nil {
		utils.Error(c, 404, "留言不存在")
		return
	}

	utils.Success(c, message)
}

func ReplyMessage(c *gin.Context) {
	id := c.Param("id")

	var message models.Message
	if err := database.DB.First(&message, id).Error; err != nil {
		utils.Error(c, 404, "留言不存在")
		return
	}

	var req struct {
		Reply string `json:"reply" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	message.Reply = req.Reply
	message.Status = 1
	database.DB.Save(&message)

	utils.Success(c, message)
}

func DeleteMessage(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Message{}, id).Error; err != nil {
		utils.Error(c, 500, "删除失败")
		return
	}

	utils.Success(c, nil)
}
