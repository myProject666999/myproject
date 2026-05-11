package controllers

import (
	"net/http"

	"jingang-hotel-backend/config"
	"jingang-hotel-backend/models"
	"jingang-hotel-backend/utils"

	"github.com/gin-gonic/gin"
)

type UserController struct{}

func (c *UserController) Register(ctx *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		RealName string `json:"realName"`
		Phone    string `json:"phone"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var existingUser models.User
	config.DB.Where("username = ?", req.Username).First(&existingUser)
	if existingUser.ID > 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户名已存在"})
		return
	}

	user := models.User{
		Username:  req.Username,
		Password:  utils.HashPassword(req.Password),
		RealName:  req.RealName,
		Phone:     req.Phone,
		MemberLevel:  1,
		MemberPoints: 100,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "注册失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "注册成功"})
}

func (c *UserController) Login(ctx *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var user models.User
	config.DB.Where("username = ?", req.Username).First(&user)
	if user.ID == 0 || !utils.ComparePassword(user.Password, req.Password) {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户名或密码错误"})
		return
	}

	if user.Status == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "账户已禁用"})
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, "user")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "登录失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"token": token,
			"user": gin.H{
				"id": user.ID,
				"username": user.Username,
				"realName": user.RealName,
				"phone": user.Phone,
				"email": user.Email,
				"memberLevel": user.MemberLevel,
				"memberPoints": user.MemberPoints,
			},
		},
	})
}

func (c *UserController) AdminLogin(ctx *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var admin models.Admin
	config.DB.Where("username = ?", req.Username).First(&admin)
	if admin.ID == 0 || !utils.ComparePassword(admin.Password, req.Password) {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户名或密码错误"})
		return
	}

	if admin.Status == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "账户已禁用"})
		return
	}

	token, err := utils.GenerateToken(admin.ID, admin.Username, "admin")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "登录失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"token": token,
			"admin": gin.H{
				"id": admin.ID,
				"username": admin.Username,
				"realName": admin.RealName,
				"isSuper": admin.IsSuper,
			},
		},
	})
}

func (c *UserController) GetProfile(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")
	var user models.User
	config.DB.First(&user, userId)

	if user.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": user,
	})
}

func (c *UserController) UpdateProfile(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")
	var user models.User
	config.DB.First(&user, userId)

	if user.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	var req struct {
		RealName string `json:"realName"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	user.RealName = req.RealName
	user.Phone = req.Phone
	user.Email = req.Email

	if err := config.DB.Save(&user).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (c *UserController) ChangePassword(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")
	var user models.User
	config.DB.First(&user, userId)

	if user.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	var req struct {
		OldPassword string `json:"oldPassword" binding:"required"`
		NewPassword string `json:"newPassword" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if !utils.ComparePassword(user.Password, req.OldPassword) {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "原密码错误"})
		return
	}

	user.Password = utils.HashPassword(req.NewPassword)
	config.DB.Save(&user)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "密码修改成功"})
}
