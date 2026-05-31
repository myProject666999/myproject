package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"online-knowledge-paid/pkg/jwt"
)

func AuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"code": http.StatusUnauthorized, "message": "missing authorization header"})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"code": http.StatusUnauthorized, "message": "invalid authorization header format"})
			return
		}

		token := parts[1]
		claims, err := jwt.ParseToken(token, secret)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"code": http.StatusUnauthorized, "message": "invalid or expired token"})
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
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"code": http.StatusForbidden, "message": "role not found"})
			return
		}

		if roleInt, ok := role.(int8); !ok || roleInt != 2 {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"code": http.StatusForbidden, "message": "admin access required"})
			return
		}

		c.Next()
	}
}

func GetUserID(c *gin.Context) uint64 {
	v, _ := c.Get("user_id")
	if id, ok := v.(uint64); ok {
		return id
	}
	return 0
}

func GetUsername(c *gin.Context) string {
	v, _ := c.Get("username")
	if name, ok := v.(string); ok {
		return name
	}
	return ""
}

func GetRole(c *gin.Context) int8 {
	v, _ := c.Get("role")
	if role, ok := v.(int8); ok {
		return role
	}
	return 0
}
