package middleware

import (
	"strings"

	"vehicle-parking/backend/config"
	"vehicle-parking/backend/utils"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(cfg config.JWTConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.Fail(c, 401, "未登录")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.Fail(c, 401, "无效的认证格式")
			c.Abort()
			return
		}

		claims, err := utils.ParseToken(parts[1], cfg.Secret)
		if err != nil {
			utils.Fail(c, 401, "Token无效或已过期")
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role.(int) != 1 {
			utils.Fail(c, 403, "需要管理员权限")
			c.Abort()
			return
		}
		c.Next()
	}
}
