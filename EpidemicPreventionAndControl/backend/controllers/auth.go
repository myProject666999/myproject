package controllers

import (
	"epidemic/config"
	"epidemic/middleware"
	"epidemic/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	LoginName string `json:"login_name" binding:"required"`
	Password  string `json:"password" binding:"required"`
	Role      string `json:"role"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if req.Role == "volunteer" {
		var volunteer models.Volunteer
		if err := config.DB.Where("login_name = ?", req.LoginName).First(&volunteer).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
			return
		}
		if !volunteer.ComparePassword(req.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
			return
		}
		if volunteer.Status != 1 {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "账户已禁用"})
			return
		}
		token, err := middleware.GenerateToken(volunteer.ID, volunteer.LoginName, volunteer.Name, "volunteer")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "生成token失败"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"code": 200,
			"message": "登录成功",
			"data": gin.H{
				"token":      token,
				"user_id":    volunteer.ID,
				"login_name": volunteer.LoginName,
				"name":       volunteer.Name,
				"role":       "volunteer",
			},
		})
		return
	}

	var admin models.User
	if err := config.DB.Where("login_name = ?", req.LoginName).First(&admin).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
		return
	}
	if !admin.ComparePassword(req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
		return
	}
	if admin.Status != 1 {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "账户已禁用"})
		return
	}

	token, err := middleware.GenerateToken(admin.ID, admin.LoginName, admin.Name, admin.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "生成token失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "登录成功",
		"data": gin.H{
			"token":      token,
			"user_id":    admin.ID,
			"login_name": admin.LoginName,
			"name":       admin.Name,
			"role":       admin.Role,
		},
	})
}

func GetInfo(c *gin.Context) {
	userID := c.GetUint("user_id")
	loginName := c.GetString("login_name")
	name := c.GetString("name")
	role := c.GetString("role")

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": gin.H{
			"id":         userID,
			"login_name": loginName,
			"name":       name,
			"role":       role,
		},
	})
}
