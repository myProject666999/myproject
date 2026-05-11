package controllers

import (
	"hospital-medical-record/database"
	"hospital-medical-record/models"
	"hospital-medical-record/utils"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token    string `json:"token"`
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	RealName string `json:"real_name"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "invalid request format")
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		utils.Unauthorized(c, "invalid username or password")
		return
	}

	if user.Status != 1 {
		utils.Unauthorized(c, "account is disabled")
		return
	}

	if !user.ComparePassword(req.Password) {
		utils.Unauthorized(c, "invalid username or password")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role, user.RealName)
	if err != nil {
		utils.InternalError(c, "failed to generate token")
		return
	}

	utils.Success(c, LoginResponse{
		Token:    token,
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		RealName: user.RealName,
	})
}

func GetCurrentUser(c *gin.Context) {
	userID := c.GetUint("user_id")

	var user models.User
	if err := database.DB.Select("id, username, role, real_name, phone, email, status, created_at").First(&user, userID).Error; err != nil {
		utils.NotFound(c, "user not found")
		return
	}

	utils.Success(c, user)
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

func ChangePassword(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "invalid request format")
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "user not found")
		return
	}

	if !user.ComparePassword(req.OldPassword) {
		utils.BadRequest(c, "old password is incorrect")
		return
	}

	if err := user.HashPassword(req.NewPassword); err != nil {
		utils.InternalError(c, "failed to hash password")
		return
	}

	if err := database.DB.Save(&user).Error; err != nil {
		utils.InternalError(c, "failed to update password")
		return
	}

	utils.SuccessWithMessage(c, "password updated successfully", nil)
}
