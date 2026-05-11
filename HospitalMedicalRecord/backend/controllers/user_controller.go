package controllers

import (
	"strings"

	"hospital-medical-record/database"
	"hospital-medical-record/models"
	"hospital-medical-record/utils"

	"github.com/gin-gonic/gin"
)

type CreateUserRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role" binding:"required,oneof=admin doctor nurse"`
	RealName string `json:"real_name" binding:"required"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Status   *int   `json:"status"`
}

type UpdateUserRequest struct {
	Username string `json:"username"`
	Role     string `json:"role" binding:"oneof=admin doctor nurse"`
	RealName string `json:"real_name"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Status   *int   `json:"status"`
}

func GetUsers(c *gin.Context) {
	page, pageSize := utils.GetPaginationParams(c)
	keyword := c.Query("keyword")
	role := c.Query("role")

	db := database.DB.Model(&models.User{})

	if keyword != "" {
		likePattern := "%" + strings.ToLower(keyword) + "%"
		db = db.Where("LOWER(username) LIKE ? OR LOWER(real_name) LIKE ? OR LOWER(phone) LIKE ?", likePattern, likePattern, likePattern)
	}

	if role != "" {
		db = db.Where("role = ?", role)
	}

	var total int64
	db.Count(&total)

	var users []models.User
	offset := (page - 1) * pageSize
	db.Order("id DESC").Offset(offset).Limit(pageSize).Find(&users)

	utils.Success(c, utils.NewPagination(page, pageSize, total, users))
}

func GetUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "user not found")
		return
	}

	utils.Success(c, user)
}

func CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "invalid request format")
		return
	}

	var existingUser models.User
	if err := database.DB.Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		utils.BadRequest(c, "username already exists")
		return
	}

	user := models.User{
		Username: req.Username,
		Role:     req.Role,
		RealName: req.RealName,
		Phone:    req.Phone,
		Email:    req.Email,
	}

	if req.Status != nil {
		user.Status = *req.Status
	}

	if err := user.HashPassword(req.Password); err != nil {
		utils.InternalError(c, "failed to hash password")
		return
	}

	if err := database.DB.Create(&user).Error; err != nil {
		utils.InternalError(c, "failed to create user")
		return
	}

	utils.SuccessWithMessage(c, "user created successfully", user)
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "user not found")
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "invalid request format")
		return
	}

	if req.Username != "" {
		var existingUser models.User
		if err := database.DB.Where("username = ? AND id != ?", req.Username, id).First(&existingUser).Error; err == nil {
			utils.BadRequest(c, "username already exists")
			return
		}
		user.Username = req.Username
	}

	if req.Role != "" {
		user.Role = req.Role
	}
	if req.RealName != "" {
		user.RealName = req.RealName
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Status != nil {
		user.Status = *req.Status
	}

	if err := database.DB.Save(&user).Error; err != nil {
		utils.InternalError(c, "failed to update user")
		return
	}

	utils.SuccessWithMessage(c, "user updated successfully", user)
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	if id == "1" {
		utils.BadRequest(c, "cannot delete default admin user")
		return
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "user not found")
		return
	}

	if err := database.DB.Delete(&user).Error; err != nil {
		utils.InternalError(c, "failed to delete user")
		return
	}

	utils.SuccessWithMessage(c, "user deleted successfully", nil)
}

func ResetUserPassword(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "user not found")
		return
	}

	defaultPassword := "123456"
	if err := user.HashPassword(defaultPassword); err != nil {
		utils.InternalError(c, "failed to hash password")
		return
	}

	if err := database.DB.Save(&user).Error; err != nil {
		utils.InternalError(c, "failed to reset password")
		return
	}

	utils.SuccessWithMessage(c, "password reset to 123456", nil)
}
