package controllers

import (
	"regexp"

	"github.com/gin-gonic/gin"
	"strayanimalrescueplatform/config"
	"strayanimalrescueplatform/models"
	"strayanimalrescueplatform/utils"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Phone    string `json:"phone"`
	Nickname string `json:"nickname"`
}

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if !emailRegex.MatchString(req.Email) {
		utils.BadRequest(c, "请输入有效的邮箱地址")
		return
	}

	var existingUser models.User
	db := config.GetDB()
	if db.Where("username = ?", req.Username).First(&existingUser).RecordNotFound() == false {
		utils.BadRequest(c, "用户名已存在")
		return
	}

	if db.Where("email = ?", req.Email).First(&existingUser).RecordNotFound() == false {
		utils.BadRequest(c, "邮箱已被注册")
		return
	}

	user := models.User{
		Username: req.Username,
		Password: req.Password,
		Email:    req.Email,
		Phone:    req.Phone,
		Nickname: req.Nickname,
		Role:     "user",
	}

	if err := db.Create(&user).Error; err != nil {
		utils.InternalServerError(c, "注册失败")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		utils.InternalServerError(c, "生成token失败")
		return
	}

	utils.Success(c, gin.H{
		"user":  user,
		"token": token,
	})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var user models.User
	db := config.GetDB()
	if err := db.Where("username = ?", req.Username).First(&user).Error; err != nil {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	if !user.ComparePassword(req.Password) {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		utils.InternalServerError(c, "生成token失败")
		return
	}

	utils.Success(c, gin.H{
		"user":  user,
		"token": token,
	})
}

func GetUserInfo(c *gin.Context) {
	userID := c.GetUint("user_id")

	var user models.User
	db := config.GetDB()
	if err := db.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	utils.Success(c, user)
}

func UpdateUserInfo(c *gin.Context) {
	userID := c.GetUint("user_id")

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	delete(updateData, "password")
	delete(updateData, "role")
	delete(updateData, "id")

	db := config.GetDB()
	if err := db.Model(&models.User{}).Where("id = ?", userID).Updates(updateData).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	var user models.User
	db.First(&user, userID)
	utils.Success(c, user)
}

func ChangePassword(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var user models.User
	db := config.GetDB()
	db.First(&user, userID)

	if !user.ComparePassword(req.OldPassword) {
		utils.BadRequest(c, "原密码错误")
		return
	}

	user.Password = req.NewPassword
	db.Save(&user)

	utils.SuccessWithMessage(c, "密码修改成功", nil)
}
