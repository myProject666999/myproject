package controllers

import (
	"urbanrail/database"
	"urbanrail/models"
	"urbanrail/utils"

	"github.com/gin-gonic/gin"
)

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Nickname string `json:"nickname"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func UserRegister(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var existingUser models.User
	if database.DB.Where("username = ?", req.Username).First(&existingUser).Error == nil {
		utils.BadRequest(c, "用户名已存在")
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.InternalServerError(c, "密码加密失败")
		return
	}

	user := models.User{
		Username: req.Username,
		Password: hashedPassword,
		Email:    req.Email,
		Phone:    req.Phone,
		Nickname: req.Nickname,
		Status:   1,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		utils.InternalServerError(c, "用户创建失败")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, "user")
	if err != nil {
		utils.InternalServerError(c, "令牌生成失败")
		return
	}

	utils.Success(c, gin.H{
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"phone":    user.Phone,
			"nickname": user.Nickname,
			"avatar":   user.Avatar,
		},
		"token": token,
	})
}

func UserLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	if user.Status != 1 {
		utils.BadRequest(c, "账号已被禁用")
		return
	}

	if !utils.CheckPassword(req.Password, user.Password) {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, "user")
	if err != nil {
		utils.InternalServerError(c, "令牌生成失败")
		return
	}

	utils.Success(c, gin.H{
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"phone":    user.Phone,
			"nickname": user.Nickname,
			"avatar":   user.Avatar,
		},
		"token": token,
	})
}

func AdminLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var admin models.Admin
	if err := database.DB.Where("username = ?", req.Username).First(&admin).Error; err != nil {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	if admin.Status != 1 {
		utils.BadRequest(c, "账号已被禁用")
		return
	}

	if !utils.CheckPassword(req.Password, admin.Password) {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	token, err := utils.GenerateToken(admin.ID, admin.Username, admin.Role)
	if err != nil {
		utils.InternalServerError(c, "令牌生成失败")
		return
	}

	utils.Success(c, gin.H{
		"admin": gin.H{
			"id":       admin.ID,
			"username": admin.Username,
			"email":    admin.Email,
			"phone":    admin.Phone,
			"nickname": admin.Nickname,
			"avatar":   admin.Avatar,
			"role":     admin.Role,
		},
		"token": token,
	})
}

func UserLogout(c *gin.Context) {
	utils.SuccessWithMessage(c, "退出登录成功", nil)
}

func GetCurrentUser(c *gin.Context) {
	userID := c.GetUint("user_id")

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	utils.Success(c, gin.H{
		"id":       user.ID,
		"username": user.Username,
		"email":    user.Email,
		"phone":    user.Phone,
		"nickname": user.Nickname,
		"avatar":   user.Avatar,
		"status":   user.Status,
		"created_at": user.CreatedAt,
	})
}

func GetCurrentAdmin(c *gin.Context) {
	adminID := c.GetUint("user_id")

	var admin models.Admin
	if err := database.DB.First(&admin, adminID).Error; err != nil {
		utils.NotFound(c, "管理员不存在")
		return
	}

	utils.Success(c, gin.H{
		"id":       admin.ID,
		"username": admin.Username,
		"email":    admin.Email,
		"phone":    admin.Phone,
		"nickname": admin.Nickname,
		"avatar":   admin.Avatar,
		"role":     admin.Role,
		"status":   admin.Status,
	})
}
