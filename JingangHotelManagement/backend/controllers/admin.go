package controllers

import (
	"net/http"

	"jingang-hotel-backend/config"
	"jingang-hotel-backend/models"
	"jingang-hotel-backend/utils"

	"github.com/gin-gonic/gin"
)

type AdminController struct{}

func (c *AdminController) GetAdmins(ctx *gin.Context) {
	var admins []models.Admin
	config.DB.Find(&admins)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": admins,
	})
}

func (c *AdminController) CreateAdmin(ctx *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		RealName string `json:"realName"`
		IsSuper  int    `json:"isSuper"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var existingAdmin models.Admin
	config.DB.Where("username = ?", req.Username).First(&existingAdmin)
	if existingAdmin.ID > 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户名已存在"})
		return
	}

	admin := models.Admin{
		Username: req.Username,
		Password: utils.HashPassword(req.Password),
		RealName: req.RealName,
		IsSuper:  req.IsSuper,
		Status:   1,
	}

	if err := config.DB.Create(&admin).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功"})
}

func (c *AdminController) UpdateAdmin(ctx *gin.Context) {
	id := ctx.Param("id")
	var admin models.Admin
	config.DB.First(&admin, id)

	if admin.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "管理员不存在"})
		return
	}

	if admin.IsSuper == 1 {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "超级管理员信息只能查看不允许修改"})
		return
	}

	var req struct {
		RealName string `json:"realName"`
		IsSuper  int    `json:"isSuper"`
		Status   int    `json:"status"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	admin.RealName = req.RealName
	admin.IsSuper = req.IsSuper
	admin.Status = req.Status
	config.DB.Save(&admin)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (c *AdminController) DeleteAdmin(ctx *gin.Context) {
	id := ctx.Param("id")
	var admin models.Admin
	config.DB.First(&admin, id)

	if admin.IsSuper == 1 {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "超级管理员不能删除"})
		return
	}

	config.DB.Delete(&models.Admin{}, id)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func (c *AdminController) ChangeAdminPassword(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")
	var admin models.Admin
	config.DB.First(&admin, userId)

	var req struct {
		OldPassword string `json:"oldPassword" binding:"required"`
		NewPassword string `json:"newPassword" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if !utils.ComparePassword(admin.Password, req.OldPassword) {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "原密码错误"})
		return
	}

	admin.Password = utils.HashPassword(req.NewPassword)
	config.DB.Save(&admin)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "密码修改成功"})
}

func (c *AdminController) GetUsers(ctx *gin.Context) {
	var users []models.User
	config.DB.Find(&users)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": users,
	})
}

func (c *AdminController) UpdateUser(ctx *gin.Context) {
	id := ctx.Param("id")
	var user models.User
	config.DB.First(&user, id)

	if user.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	var req struct {
		RealName     string `json:"realName"`
		Phone        string `json:"phone"`
		Email        string `json:"email"`
		MemberLevel  int    `json:"memberLevel"`
		MemberPoints int    `json:"memberPoints"`
		Status       int    `json:"status"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	user.RealName = req.RealName
	user.Phone = req.Phone
	user.Email = req.Email
	user.MemberLevel = req.MemberLevel
	user.MemberPoints = req.MemberPoints
	user.Status = req.Status
	config.DB.Save(&user)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}
