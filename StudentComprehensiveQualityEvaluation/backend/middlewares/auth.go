package middlewares

import (
	"net/http"
	"strings"

	"student_quality_system/config"
	"student_quality_system/models"
	"student_quality_system/utils"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "未登录"})
			c.Abort()
			return
		}
		
		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "无效的Token格式"})
			c.Abort()
			return
		}
		
		claims, err := utils.ParseToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "Token无效或已过期"})
			c.Abort()
			return
		}
		
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Set("real_name", claims.RealName)
		
		c.Next()
	}
}

func PermissionMiddleware(module string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("role")
		
		var permission models.Permission
		if err := config.DB.Where("role = ? AND module = ?", role, module).First(&permission).Error; err != nil {
			if role == "admin" {
				c.Next()
				return
			}
			c.JSON(http.StatusForbidden, gin.H{"code": 403, "message": "无此模块权限"})
			c.Abort()
			return
		}
		
		method := c.Request.Method
		var hasPermission bool
		
		switch method {
		case "GET":
			hasPermission = permission.CanView
		case "POST":
			hasPermission = permission.CanCreate
		case "PUT", "PATCH":
			hasPermission = permission.CanUpdate
		case "DELETE":
			hasPermission = permission.CanDelete
		default:
			hasPermission = permission.CanView
		}
		
		if !hasPermission {
			c.JSON(http.StatusForbidden, gin.H{"code": 403, "message": "无此操作权限"})
			c.Abort()
			return
		}
		
		c.Next()
	}
}

func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("role")
		if role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"code": 403, "message": "仅管理员可访问"})
			c.Abort()
			return
		}
		c.Next()
	}
}
