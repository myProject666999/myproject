package controllers

import (
	"campus-trading/config"
	"campus-trading/models"
	"campus-trading/utils"
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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
		log.Printf("Register: bind error: %v", err)
		utils.BadRequest(c, "参数错误")
		return
	}

	log.Printf("Register attempt with username: %s", req.Username)

	var existingUser models.User
	result := config.DB.Where("username = ?", req.Username).First(&existingUser)
	
	if result.Error == nil {
		log.Printf("Register: username %s already exists", req.Username)
		utils.BadRequest(c, "用户名已存在")
		return
	} else if result.Error != gorm.ErrRecordNotFound {
		log.Printf("Register: database error when checking username: %v", result.Error)
		utils.ServerError(c, "服务器错误")
		return
	}

	log.Printf("Register: username %s is available, creating user...", req.Username)

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		log.Printf("Register: hash password error: %v", err)
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
		log.Printf("Register: create user error: %v", result.Error)
		utils.ServerError(c, "注册失败")
		return
	}

	log.Printf("Register: user %s created successfully with id: %d", user.Username, user.ID)

	utils.Success(c, gin.H{
		"id":       user.ID,
		"username": user.Username,
	})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Login: bind error: %v", err)
		utils.BadRequest(c, "参数错误")
		return
	}

	log.Printf("Login attempt with username: %s", req.Username)

	var user models.User
	result := config.DB.Where("username = ?", req.Username).First(&user)
	if result.Error != nil {
		log.Printf("Login: user %s not found: %v", req.Username, result.Error)
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	log.Printf("Login: found user %s, status=%d, role=%s", user.Username, user.Status, user.Role)

	if user.Status != 1 {
		log.Printf("Login: user %s is disabled (status=%d)", user.Username, user.Status)
		utils.Forbidden(c, "账号已被禁用")
		return
	}

	if !utils.CheckPassword(req.Password, user.Password) {
		log.Printf("Login: password incorrect for user %s", user.Username)
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	cfg, _ := config.LoadConfig()
	expireHours, _ := strconv.Atoi(cfg.JWTExpireHours)

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role, cfg.JWTSecret, expireHours)
	if err != nil {
		log.Printf("Login: token generation error: %v", err)
		utils.ServerError(c, "生成token失败")
		return
	}

	log.Printf("Login: user %s logged in successfully", user.Username)

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
		log.Printf("AdminLogin: bind error: %v", err)
		utils.BadRequest(c, "参数错误")
		return
	}

	log.Printf("AdminLogin attempt with username: %s", req.Username)

	var user models.User
	result := config.DB.Where("username = ? AND role = ?", req.Username, "admin").First(&user)
	if result.Error != nil {
		log.Printf("AdminLogin: admin user %s not found: %v", req.Username, result.Error)
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	log.Printf("AdminLogin: found admin user %s, status=%d", user.Username, user.Status)

	if user.Status != 1 {
		log.Printf("AdminLogin: admin user %s is disabled (status=%d)", user.Username, user.Status)
		utils.Forbidden(c, "账号已被禁用")
		return
	}

	if !utils.CheckPassword(req.Password, user.Password) {
		log.Printf("AdminLogin: password incorrect for admin user %s", user.Username)
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	cfg, _ := config.LoadConfig()
	expireHours, _ := strconv.Atoi(cfg.JWTExpireHours)

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role, cfg.JWTSecret, expireHours)
	if err != nil {
		log.Printf("AdminLogin: token generation error: %v", err)
		utils.ServerError(c, "生成token失败")
		return
	}

	log.Printf("AdminLogin: admin user %s logged in successfully", user.Username)

	utils.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"role":     user.Role,
		},
	})
}
