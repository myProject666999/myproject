package controllers

import (
	"net/http"
	"watercharge/database"
	"watercharge/models"
	"watercharge/utils"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "无效的请求参数"})
		return
	}

	if req.Role == "admin" {
		var admin models.Admin
		if err := database.DB.Where("username = ?", req.Username).First(&admin).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
			return
		}
		if !utils.CheckPasswordHash(req.Password, admin.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
			return
		}
		token, err := utils.GenerateToken(admin.ID, admin.Username, "admin")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "生成令牌失败"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"code": 200,
			"message": "登录成功",
			"data": gin.H{
				"token": token,
				"user":  admin,
				"role":  "admin",
			},
		})
	} else {
		var user models.User
		if err := database.DB.Where("username = ? OR user_no = ?", req.Username, req.Username).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
			return
		}
		if user.Status != "active" {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户已被禁用，请联系管理员"})
			return
		}
		if !utils.CheckPasswordHash(req.Password, user.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
			return
		}
		token, err := utils.GenerateToken(user.ID, user.Username, "user")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "生成令牌失败"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"code": 200,
			"message": "登录成功",
			"data": gin.H{
				"token": token,
				"user":  user,
				"role":  "user",
			},
		})
	}
}

func GetCurrentUser(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	if role == "admin" {
		var admin models.Admin
		database.DB.First(&admin, userID)
		c.JSON(http.StatusOK, gin.H{"code": 200, "data": admin})
	} else {
		var user models.User
		database.DB.Preload("Community").First(&user, userID)
		c.JSON(http.StatusOK, gin.H{"code": 200, "data": user})
	}
}
