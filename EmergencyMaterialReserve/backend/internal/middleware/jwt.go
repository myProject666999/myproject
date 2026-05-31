package middleware

import (
	"net/http"
	"strings"

	"emergency-material/pkg/jwt"
	"emergency-material/pkg/response"

	"github.com/gin-gonic/gin"
)

const (
	UserIDKey   = "user_id"
	UsernameKey = "username"
	RoleKey     = "role"
)

var publicPaths = map[string]bool{
	"/api/auth/login":    true,
	"/api/auth/register": true,
}

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		if publicPaths[c.FullPath()] {
			c.Next()
			return
		}

		authHeader := c.Request.Header.Get("Authorization")
		if authHeader == "" {
			response.ErrorWithCode(c, http.StatusUnauthorized, "未提供认证令牌")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			response.ErrorWithCode(c, http.StatusUnauthorized, "认证令牌格式错误")
			c.Abort()
			return
		}

		claims, err := jwt.ParseToken(parts[1])
		if err != nil {
			response.ErrorWithCode(c, http.StatusUnauthorized, "认证令牌无效或已过期")
			c.Abort()
			return
		}

		c.Set(UserIDKey, claims.UserID)
		c.Set(UsernameKey, claims.Username)
		c.Set(RoleKey, claims.Role)

		c.Next()
	}
}
