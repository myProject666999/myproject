package controllers

import (
	"net/http"
	"strconv"
	"time"

	"student_quality_system/config"
	"student_quality_system/models"

	"github.com/gin-gonic/gin"
)

func GetMessages(c *gin.Context) {
	var pageInfo PageInfo
	if err := c.ShouldBindQuery(&pageInfo); err != nil {
		pageInfo.Page = 1
		pageInfo.PageSize = 10
	}
	
	if pageInfo.Page <= 0 {
		pageInfo.Page = 1
	}
	if pageInfo.PageSize <= 0 {
		pageInfo.PageSize = 10
	}
	
	query := config.DB.Model(&models.Message{})
	
	if title := c.Query("title"); title != "" {
		query = query.Where("title LIKE ?", "%"+title+"%")
	}
	if senderName := c.Query("sender_name"); senderName != "" {
		query = query.Where("sender_name LIKE ?", "%"+senderName+"%")
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	role, _ := c.Get("role")
	if role == "student" {
		userID, _ := c.Get("user_id")
		query = query.Where("sender_id = ?", userID)
	}
	
	var total int64
	query.Count(&total)
	
	var messages []models.Message
	query.Order("created_at DESC").Offset((pageInfo.Page - 1) * pageInfo.PageSize).Limit(pageInfo.PageSize).Find(&messages)
	
	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": gin.H{
			"list": messages,
			"total": total,
			"page": pageInfo.Page,
			"pageSize": pageInfo.PageSize,
		},
	})
}

func GetMessage(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	var message models.Message
	if err := config.DB.First(&message, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "留言不存在"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "success", "data": message})
}

func CreateMessage(c *gin.Context) {
	userID, _ := c.Get("user_id")
	realName, _ := c.Get("real_name")
	role, _ := c.Get("role")
	
	var message models.Message
	if err := c.ShouldBindJSON(&message); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	message.SenderID = userID.(uint)
	message.SenderName = realName.(string)
	message.SenderRole = role.(string)
	message.Status = "unreplied"
	
	if err := config.DB.Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": message})
}

func ReplyMessage(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	var message models.Message
	if err := config.DB.First(&message, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "留言不存在"})
		return
	}
	
	var req struct {
		Reply string `json:"reply" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	now := time.Now()
	message.Reply = req.Reply
	message.ReplyTime = &now
	message.Status = "replied"
	
	if err := config.DB.Save(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "回复失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "回复成功", "data": message})
}

func DeleteMessage(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	if err := config.DB.Delete(&models.Message{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
