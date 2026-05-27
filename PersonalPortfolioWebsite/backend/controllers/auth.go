package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"portfolio/config"
	"portfolio/database"
	"portfolio/middleware"
	"portfolio/models"
)

func Login(c *gin.Context) {
	var loginData struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var admin models.Admin
	if err := database.DB.Where("username = ?", loginData.Username).First(&admin).Error; err != nil {
		if loginData.Username == config.App.AdminUsername && loginData.Password == config.App.AdminPassword {
			hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(config.App.AdminPassword), bcrypt.DefaultCost)
			admin = models.Admin{
				Username: config.App.AdminUsername,
				Password: string(hashedPassword),
			}
			database.DB.Create(&admin)
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(loginData.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &middleware.Claims{
		Username: admin.Username,
		Role:     "admin",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.App.JWTSecret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user": gin.H{
			"username": admin.Username,
			"role":     "admin",
		},
	})
}
