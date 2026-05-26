package handlers

import (
	"net/http"

	"barrage_interaction/models"

	"github.com/gin-gonic/gin"
)

type RegisterRequest struct {
	Nickname string `json:"nickname" binding:"required"`
	Avatar   string `json:"avatar"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ip := c.ClientIP()

	user := models.User{
		Nickname: req.Nickname,
		Avatar:   req.Avatar,
		IP:       ip,
	}

	if err := models.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User registered successfully",
		"user":    user,
	})
}

func Login(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := models.DB.Where("nickname = ?", req.Nickname).First(&user).Error; err != nil {
		user = models.User{
			Nickname: req.Nickname,
			Avatar:   req.Avatar,
			IP:       c.ClientIP(),
		}
		if err := models.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user":    user,
	})
}

type AdminLoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func AdminLogin(c *gin.Context) {
	var req AdminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var admin models.AdminUser
	if err := models.DB.Where("username = ? AND password = ?", req.Username, req.Password).First(&admin).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Admin login successful",
		"admin": gin.H{
			"id":       admin.ID,
			"username": admin.Username,
		},
	})
}

func GetUsers(c *gin.Context) {
	var users []models.User
	if err := models.DB.Order("created_at DESC").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"users": users})
}
