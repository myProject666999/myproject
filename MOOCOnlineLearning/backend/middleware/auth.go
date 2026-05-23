package middleware

import (
	"net/http"
	"strings"

	"mooc-platform/config"
	"mooc-platform/utils"

	"github.com/gin-gonic/gin"
)

const (
	UserIDKey = "userID"
	RoleKey   = "role"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.Response(c, http.StatusUnauthorized, "未登录", nil)
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			utils.Response(c, http.StatusUnauthorized, "Token格式错误", nil)
			c.Abort()
			return
		}

		claims, err := utils.ParseToken(parts[1], config.Cfg.JWT.Secret)
		if err != nil {
			utils.Response(c, http.StatusUnauthorized, "Token已失效", nil)
			c.Abort()
			return
		}

		c.Set(UserIDKey, claims.UserID)
		c.Set(RoleKey, claims.Role)
		c.Next()
	}
}

func TeacherMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get(RoleKey)
		if role.(string) != "teacher" && role.(string) != "admin" {
			utils.Response(c, http.StatusForbidden, "权限不足", nil)
			c.Abort()
			return
		}
		c.Next()
	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get(RoleKey)
		if role.(string) != "admin" {
			utils.Response(c, http.StatusForbidden, "权限不足", nil)
			c.Abort()
			return
		}
		c.Next()
	}
}
