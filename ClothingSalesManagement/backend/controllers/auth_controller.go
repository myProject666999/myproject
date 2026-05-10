package controllers

import (
	"clothingsales/config"
	"clothingsales/database"
	"clothingsales/models"
	"clothingsales/utils"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	cfg *config.Config
}

func NewAuthController(cfg *config.Config) *AuthController {
	return &AuthController{cfg: cfg}
}

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

func (ac *AuthController) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var existingUser models.User
	if err := database.DB.Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		utils.BadRequest(c, "用户名已存在")
		return
	}

	if req.Email != "" {
		var existingEmail models.User
		if err := database.DB.Where("email = ?", req.Email).First(&existingEmail).Error; err == nil {
			utils.BadRequest(c, "邮箱已被注册")
			return
		}
	}

	user := models.User{
		Username: req.Username,
		Nickname: req.Nickname,
		Role:     "member",
		Status:   1,
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}

	if err := user.HashPassword(req.Password); err != nil {
		utils.InternalError(c, "密码加密失败")
		return
	}

	if err := database.DB.Create(&user).Error; err != nil {
		utils.InternalError(c, "注册失败: "+err.Error())
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role, ac.cfg.JWTSecret)
	if err != nil {
		utils.InternalError(c, "生成Token失败")
		return
	}

	utils.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"phone":    user.Phone,
			"nickname": user.Nickname,
			"role":     user.Role,
		},
	})
}

func (ac *AuthController) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	if user.Status != 1 {
		utils.Forbidden(c, "账号已被禁用")
		return
	}

	if !user.ComparePassword(req.Password) {
		utils.BadRequest(c, "密码错误")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role, ac.cfg.JWTSecret)
	if err != nil {
		utils.InternalError(c, "生成Token失败")
		return
	}

	utils.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"phone":    user.Phone,
			"nickname": user.Nickname,
			"avatar":   user.Avatar,
			"role":     user.Role,
		},
	})
}

func (ac *AuthController) Logout(c *gin.Context) {
	utils.SuccessWithMessage(c, "退出登录成功", nil)
}

func (ac *AuthController) GetCurrentUser(c *gin.Context) {
	userID, _ := c.Get("userID")

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
		"role":     user.Role,
		"status":   user.Status,
	})
}
