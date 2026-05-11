package controllers

import (
	"net/http"

	"student_quality_system/config"
	"student_quality_system/models"
	"student_quality_system/utils"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	var user models.User
	if err := config.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户名或密码错误"})
		return
	}
	
	if !user.ComparePassword(req.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户名或密码错误"})
		return
	}
	
	token, err := utils.GenerateToken(user.ID, user.Username, user.Role, user.RealName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "生成Token失败"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "登录成功",
		"data": gin.H{
			"token": token,
			"user": gin.H{
				"id": user.ID,
				"username": user.Username,
				"role": user.Role,
				"real_name": user.RealName,
				"email": user.Email,
				"phone": user.Phone,
			},
		},
	})
}

func GetCurrentUser(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": user,
	})
}

func UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}
	
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": user})
}

func ChangePassword(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}
	
	if !user.ComparePassword(req.OldPassword) {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "原密码错误"})
		return
	}
	
	if err := user.SetPassword(req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "密码加密失败"})
		return
	}
	
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "密码修改成功"})
}

func GetPermissions(c *gin.Context) {
	role, _ := c.Get("role")
	
	var permissions []models.Permission
	config.DB.Where("role = ?", role).Find(&permissions)
	
	permissionMap := make(map[string]map[string]bool)
	for _, p := range permissions {
		permissionMap[p.Module] = map[string]bool{
			"can_view":   p.CanView,
			"can_create": p.CanCreate,
			"can_update": p.CanUpdate,
			"can_delete": p.CanDelete,
		}
	}
	
	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": permissionMap,
	})
}
