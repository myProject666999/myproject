package controllers

import (
	"net/http"

	"english-learning/config"
	"english-learning/database"
	"english-learning/models"
	"english-learning/utils"

	"github.com/gin-gonic/gin"
)

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	if _, err := database.DB.GetUserByEmail(req.Email); err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	activationToken, err := utils.GenerateToken(32)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate activation token"})
		return
	}

	user := models.User{
		Email:           req.Email,
		Password:        hashedPassword,
		Name:            req.Name,
		Role:            "user",
		IsActive:        false,
		ActivationToken: activationToken,
	}

	if err := database.DB.CreateUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	cfg := config.LoadConfig()
	activationURL := cfg.AppURL + "/activate?token=" + activationToken
	emailBody := `
		<h2>Welcome to English Learning System!</h2>
		<p>Please click the link below to activate your account:</p>
		<p><a href="` + activationURL + `">` + activationURL + `</a></p>
		<p>If you didn't register, please ignore this email.</p>
	`

	go func() {
		if cfg.EmailUser != "" {
			utils.SendEmail(req.Email, "Activate Your Account", emailBody)
		}
	}()

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registration successful! Please check your email to activate your account.",
		"info":    "For demo purposes, you can also activate using the token in URL: /activate?token=" + activationToken,
	})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	user, err := database.DB.GetUserByEmail(req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if !user.IsActive {
		c.JSON(http.StatusForbidden, gin.H{"error": "Account not activated. Please check your email."})
		return
	}

	if !utils.CheckPassword(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token, err := utils.GenerateJWT(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"name":  user.Name,
			"role":  user.Role,
		},
	})
}

func Activate(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Activation token is required"})
		return
	}

	user, err := database.DB.GetUserByToken(token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invalid activation token"})
		return
	}

	if user.IsActive {
		c.JSON(http.StatusOK, gin.H{"message": "Account is already activated"})
		return
	}

	user.IsActive = true
	user.ActivationToken = ""
	if err := database.DB.SaveUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to activate account"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Account activated successfully! You can now log in."})
}

func GetCurrentUser(c *gin.Context) {
	userID := c.GetUint("userID")

	user, err := database.DB.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":    user.ID,
		"email": user.Email,
		"name":  user.Name,
		"role":  user.Role,
	})
}
