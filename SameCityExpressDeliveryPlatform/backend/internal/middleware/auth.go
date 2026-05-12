package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"

	"samecity-express/pkg/utils"
)

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.Unauthorized(c, "未提供认证令牌")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			utils.Unauthorized(c, "认证令牌格式错误")
			c.Abort()
			return
		}

		claims, err := utils.ParseToken(parts[1])
		if err != nil {
			utils.Unauthorized(c, err.Error())
			c.Abort()
			return
		}

		c.Set("claims", claims)
		if claims.UserID > 0 {
			c.Set("user_id", claims.UserID)
			c.Set("role", "user")
		}
		if claims.RiderID > 0 {
			c.Set("rider_id", claims.RiderID)
			c.Set("role", "rider")
		}
		if claims.AdminID > 0 {
			c.Set("admin_id", claims.AdminID)
			c.Set("role", "admin")
		}
		c.Next()
	}
}

func UserAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "user" {
			utils.Forbidden(c, "需要用户权限")
			c.Abort()
			return
		}
		c.Next()
	}
}

func RiderAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "rider" {
			utils.Forbidden(c, "需要骑手权限")
			c.Abort()
			return
		}
		c.Next()
	}
}

func AdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "admin" {
			utils.Forbidden(c, "需要管理员权限")
			c.Abort()
			return
		}
		c.Next()
	}
}
