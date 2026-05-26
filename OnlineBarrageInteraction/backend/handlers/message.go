package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"barrage_interaction/config"
	"barrage_interaction/models"
	"barrage_interaction/utils"

	"github.com/gin-gonic/gin"
)

type CreateMessageRequest struct {
	UserID  uint   `json:"user_id" binding:"required"`
	Content string `json:"content" binding:"required"`
}

func CreateMessage(c *gin.Context) {
	var req CreateMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(req.Content) > 200 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message too long (max 200 characters)"})
		return
	}

	filteredContent, isSensitive := utils.FilterSensitiveWords(req.Content)

	message := models.Message{
		UserID:      req.UserID,
		Content:     filteredContent,
		IsSensitive: 0,
		Status:      0,
	}

	if isSensitive {
		message.IsSensitive = 1
		message.Status = 2
	}

	if err := models.DB.Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create message"})
		return
	}

	if message.Status == 0 {
		go publishMessage(message)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "Message created successfully",
		"barrage_msg":  message,
		"is_sensitive": isSensitive,
	})
}

func publishMessage(message models.Message) {
	redisClient := config.NewRedisClient()
	defer redisClient.Close()

	var user models.User
	models.DB.First(&user, message.UserID)
	message.User = user

	data, _ := json.Marshal(message)
	redisClient.Publish(config.Ctx, config.AppConfig.Redis.Channel, data)
}

type GetMessagesQuery struct {
	Status int `form:"status"`
	Limit  int `form:"limit,default=20"`
	Offset int `form:"offset,default=0"`
}

func GetMessages(c *gin.Context) {
	var query GetMessagesQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := models.DB.Preload("User")
	if query.Status >= 0 {
		db = db.Where("status = ?", query.Status)
	}

	var total int64
	db.Model(&models.Message{}).Count(&total)

	var messages []models.Message
	if err := db.Order("created_at DESC").Limit(query.Limit).Offset(query.Offset).Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"messages": messages,
		"total":    total,
	})
}

func GetPendingMessages(c *gin.Context) {
	var messages []models.Message
	if err := models.DB.Preload("User").Where("status = ?", 0).Order("created_at ASC").Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pending messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}

func ApproveMessage(c *gin.Context) {
	id := c.Param("id")

	var message models.Message
	if err := models.DB.Where("id = ?", id).First(&message).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Message not found"})
		return
	}

	message.Status = 1
	if err := models.DB.Save(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve message"})
		return
	}

	go publishMessage(message)

	c.JSON(http.StatusOK, gin.H{
		"message": "Message approved successfully",
		"data":    message,
	})
}

func RejectMessage(c *gin.Context) {
	id := c.Param("id")

	var message models.Message
	if err := models.DB.Where("id = ?", id).First(&message).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Message not found"})
		return
	}

	message.Status = 2
	if err := models.DB.Save(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject message"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Message rejected successfully",
	})
}

func StartRedisSubscriber() {
	go func() {
		redisClient := config.NewRedisClient()
		defer redisClient.Close()

		subscriber := redisClient.Subscribe(config.Ctx, config.AppConfig.Redis.Channel)
		defer subscriber.Close()

		channel := subscriber.Channel()
		for msg := range channel {
			log.Printf("Received message from Redis: %s", msg.Payload)
		}
	}()
}
