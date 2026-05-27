package controllers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"portfolio/database"
	"portfolio/models"
)

var (
	contactRateLimit = make(map[string]time.Time)
	spamKeywords     = []string{"viagra", "casino", "porn", "bitcoin", "investment", "赚钱", "赌博", "色情", "贷款"}
)

func GetContacts(c *gin.Context) {
	unread := c.Query("unread")

	db := database.DB.Model(&models.Contact{})

	if unread == "true" {
		db = db.Where("`read` = ?", false)
	}

	var contacts []models.Contact
	db.Order("created_at DESC").Find(&contacts)
	c.JSON(http.StatusOK, contacts)
}

func CreateContact(c *gin.Context) {
	var contact models.Contact
	if err := c.ShouldBindJSON(&contact); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ip := c.ClientIP()

	if lastContact, exists := contactRateLimit[ip]; exists {
		if time.Since(lastContact) < 30*time.Second {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Please wait before submitting another message"})
			return
		}
	}

	if isSpam(contact.Message, contact.Email) {
		contact.IsSpam = true
	}

	contact.IPAddress = ip
	contact.UserAgent = c.Request.UserAgent()

	if err := database.DB.Create(&contact).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	contactRateLimit[ip] = time.Now()

	c.JSON(http.StatusCreated, gin.H{"message": "Message sent successfully"})
}

func MarkContactRead(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var contact models.Contact
	if err := database.DB.First(&contact, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contact not found"})
		return
	}

	contact.Read = true
	database.DB.Save(&contact)

	c.JSON(http.StatusOK, contact)
}

func DeleteContact(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := database.DB.Delete(&models.Contact{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Contact deleted successfully"})
}

func isSpam(message, email string) bool {
	lowerMessage := strings.ToLower(message)
	lowerEmail := strings.ToLower(email)

	for _, keyword := range spamKeywords {
		if strings.Contains(lowerMessage, keyword) || strings.Contains(lowerEmail, keyword) {
			return true
		}
	}

	if strings.Contains(lowerMessage, "http://") || strings.Contains(lowerMessage, "https://") {
		if strings.Count(lowerMessage, "http") > 2 {
			return true
		}
	}

	return false
}
