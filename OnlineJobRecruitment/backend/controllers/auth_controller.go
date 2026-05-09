package controllers

import (
	"online-job-recruitment/database"
	"online-job-recruitment/models"
	"online-job-recruitment/utils"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Name     string `json:"name"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	if user.Status == 0 {
		utils.Forbidden(c, "账号已被禁用")
		return
	}

	if !user.CheckPassword(req.Password) {
		utils.BadRequest(c, "密码错误")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		utils.InternalServerError(c, "生成Token失败")
		return
	}

	utils.Success(c, gin.H{
		"token":    token,
		"user":     user,
		"user_id":  user.ID,
		"username": user.Username,
		"role":     user.Role,
	})
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var existingUser models.User
	if database.DB.Where("username = ?", req.Username).First(&existingUser).Error == nil {
		utils.BadRequest(c, "用户名已存在")
		return
	}

	user := models.User{
		Username: req.Username,
		Role:     "user",
		Name:     req.Name,
		Phone:    req.Phone,
		Email:    req.Email,
		Status:   1,
	}

	if err := user.SetPassword(req.Password); err != nil {
		utils.InternalServerError(c, "密码加密失败")
		return
	}

	if err := database.DB.Create(&user).Error; err != nil {
		utils.InternalServerError(c, "注册失败")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		utils.InternalServerError(c, "生成Token失败")
		return
	}

	utils.Success(c, gin.H{
		"token": token,
		"user":  user,
	})
}

func GetCurrentUser(c *gin.Context) {
	userID := c.GetUint("userID")

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	utils.Success(c, user)
}

func ChangePassword(c *gin.Context) {
	userID := c.GetUint("userID")

	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	if !user.CheckPassword(req.OldPassword) {
		utils.BadRequest(c, "旧密码错误")
		return
	}

	if err := user.SetPassword(req.NewPassword); err != nil {
		utils.InternalServerError(c, "密码加密失败")
		return
	}

	if err := database.DB.Save(&user).Error; err != nil {
		utils.InternalServerError(c, "修改密码失败")
		return
	}

	utils.SuccessWithMessage(c, "密码修改成功", nil)
}

func UpdateProfile(c *gin.Context) {
	userID := c.GetUint("userID")

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	if err := c.ShouldBindJSON(&user); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	user.ID = userID

	if err := database.DB.Save(&user).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	utils.Success(c, user)
}
