package controllers

import (
	"campus-trading/config"
	"campus-trading/models"
	"campus-trading/utils"
	"strconv"

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

type UpdateUserRequest struct {
	Nickname string `json:"nickname"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Avatar   string `json:"avatar"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var existingUser models.User
	if result := config.DB.Where("username = ?", req.Username).First(&existingUser); result.Error == nil {
		utils.BadRequest(c, "用户名已存在")
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.ServerError(c, "密码加密失败")
		return
	}

	user := models.User{
		Username: req.Username,
		Password: hashedPassword,
		Email:    req.Email,
		Phone:    req.Phone,
		Nickname: req.Nickname,
		Role:     "user",
		Status:   1,
	}

	if result := config.DB.Create(&user); result.Error != nil {
		utils.ServerError(c, "注册失败")
		return
	}

	utils.Success(c, gin.H{
		"id":       user.ID,
		"username": user.Username,
	})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var user models.User
	if result := config.DB.Where("username = ?", req.Username).First(&user); result.Error != nil {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	if user.Status != 1 {
		utils.Forbidden(c, "账号已被禁用")
		return
	}

	if !utils.CheckPassword(req.Password, user.Password) {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	cfg, _ := config.LoadConfig()
	expireHours, _ := strconv.Atoi(cfg.JWTExpireHours)

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role, cfg.JWTSecret, expireHours)
	if err != nil {
		utils.ServerError(c, "生成token失败")
		return
	}

	utils.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"nickname": user.Nickname,
			"email":    user.Email,
			"phone":    user.Phone,
			"avatar":   user.Avatar,
			"role":     user.Role,
		},
	})
}

func GetCurrentUser(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	if result := config.DB.First(&user, userID); result.Error != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	utils.Success(c, gin.H{
		"id":       user.ID,
		"username": user.Username,
		"nickname": user.Nickname,
		"email":    user.Email,
		"phone":    user.Phone,
		"avatar":   user.Avatar,
		"role":     user.Role,
		"created_at": user.CreatedAt,
	})
}

func UpdateCurrentUser(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	updates := make(map[string]interface{})
	if req.Nickname != "" {
		updates["nickname"] = req.Nickname
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Avatar != "" {
		updates["avatar"] = req.Avatar
	}

	if result := config.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates); result.Error != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", nil)
}

func ChangePassword(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var user models.User
	if result := config.DB.First(&user, userID); result.Error != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	if !utils.CheckPassword(req.OldPassword, user.Password) {
		utils.BadRequest(c, "原密码错误")
		return
	}

	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		utils.ServerError(c, "密码加密失败")
		return
	}

	if result := config.DB.Model(&user).Update("password", hashedPassword); result.Error != nil {
		utils.ServerError(c, "修改密码失败")
		return
	}

	utils.SuccessWithMessage(c, "密码修改成功", nil)
}

func AdminLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var user models.User
	if result := config.DB.Where("username = ? AND role = ?", req.Username, "admin").First(&user); result.Error != nil {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	if user.Status != 1 {
		utils.Forbidden(c, "账号已被禁用")
		return
	}

	if !utils.CheckPassword(req.Password, user.Password) {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	cfg, _ := config.LoadConfig()
	expireHours, _ := strconv.Atoi(cfg.JWTExpireHours)

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role, cfg.JWTSecret, expireHours)
	if err != nil {
		utils.ServerError(c, "生成token失败")
		return
	}

	utils.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"role":     user.Role,
		},
	})
}
