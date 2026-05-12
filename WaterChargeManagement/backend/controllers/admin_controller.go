package controllers

import (
	"net/http"
	"strconv"
	"watercharge/database"
	"watercharge/models"
	"watercharge/utils"

	"github.com/gin-gonic/gin"
)

func GetAdmins(c *gin.Context) {
	var admins []models.Admin
	database.DB.Find(&admins)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": admins})
}

func GetAdmin(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var admin models.Admin
	if err := database.DB.First(&admin, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "管理员不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": admin})
}

func CreateAdmin(c *gin.Context) {
	var req models.CreateAdminRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	hashedPassword, _ := utils.HashPassword(req.Password)

	admin := models.Admin{
		Username: req.Username,
		Password: hashedPassword,
		Name:     req.Name,
		Phone:    req.Phone,
		Role:     req.Role,
	}
	if admin.Role == "" {
		admin.Role = "admin"
	}

	if err := database.DB.Create(&admin).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户名已存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": admin})
}

func UpdateAdmin(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var admin models.Admin
	if err := database.DB.First(&admin, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "管理员不存在"})
		return
	}

	var req models.UpdateAdminRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	updates := map[string]interface{}{
		"Name":  req.Name,
		"Phone": req.Phone,
	}

	if req.Role != "" {
		updates["Role"] = req.Role
	}
	if req.Password != "" {
		hashedPassword, _ := utils.HashPassword(req.Password)
		updates["Password"] = hashedPassword
	}

	database.DB.Model(&admin).Updates(updates)
	database.DB.First(&admin, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": admin})
}

func DeleteAdmin(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if id == 1 {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "不能删除超级管理员"})
		return
	}
	database.DB.Delete(&models.Admin{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ChangeAdminPassword(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	var admin models.Admin
	database.DB.First(&admin, userID)

	if !utils.CheckPasswordHash(req.OldPassword, admin.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "原密码错误"})
		return
	}

	hashedPassword, _ := utils.HashPassword(req.NewPassword)
	database.DB.Model(&admin).Update("Password", hashedPassword)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "密码修改成功"})
}
