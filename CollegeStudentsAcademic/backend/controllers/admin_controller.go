package controllers

import (
	"college-academic/database"
	"college-academic/models"
	"college-academic/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func AdminLogin(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	var admin models.Admin
	if err := database.DB.Where("username = ?", req.Username).First(&admin).Error; err != nil {
		utils.Error(c, 401, "用户名或密码错误")
		return
	}

	if !utils.CheckPassword(req.Password, admin.Password) {
		utils.Error(c, 401, "用户名或密码错误")
		return
	}

	token, err := utils.GenerateToken(admin.ID, admin.Username, "admin")
	if err != nil {
		utils.Error(c, 500, "生成令牌失败")
		return
	}

	utils.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":        admin.ID,
			"username":  admin.Username,
			"real_name": admin.RealName,
			"role":      "admin",
		},
	})
}

func GetAdminInfo(c *gin.Context) {
	userID := c.GetUint("user_id")

	var admin models.Admin
	if err := database.DB.First(&admin, userID).Error; err != nil {
		utils.Error(c, 404, "用户不存在")
		return
	}

	utils.Success(c, admin)
}

func ChangeAdminPassword(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	var admin models.Admin
	if err := database.DB.First(&admin, userID).Error; err != nil {
		utils.Error(c, 404, "用户不存在")
		return
	}

	if !utils.CheckPassword(req.OldPassword, admin.Password) {
		utils.Error(c, 400, "原密码错误")
		return
	}

	hashed, _ := utils.HashPassword(req.NewPassword)
	admin.Password = hashed
	database.DB.Save(&admin)

	utils.Success(c, nil)
}

func GetAdminList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var admins []models.Admin
	var total int64

	query := database.DB.Model(&models.Admin{})
	query.Count(&total)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Find(&admins)

	utils.SuccessPage(c, admins, total, page, pageSize)
}

func CreateAdmin(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		RealName string `json:"real_name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	var existing models.Admin
	if database.DB.Where("username = ?", req.Username).First(&existing).Error == nil {
		utils.Error(c, 400, "用户名已存在")
		return
	}

	hashed, _ := utils.HashPassword(req.Password)
	admin := models.Admin{
		Username: req.Username,
		Password: hashed,
		RealName: req.RealName,
	}

	if err := database.DB.Create(&admin).Error; err != nil {
		utils.Error(c, 500, "创建失败")
		return
	}

	utils.Success(c, admin)
}

func DeleteAdmin(c *gin.Context) {
	id := c.Param("id")

	var admin models.Admin
	if err := database.DB.First(&admin, id).Error; err != nil {
		utils.Error(c, 404, "管理员不存在")
		return
	}

	if admin.Username == "admin" {
		utils.Error(c, 400, "超级管理员不能删除")
		return
	}

	database.DB.Delete(&admin)
	utils.Success(c, nil)
}
