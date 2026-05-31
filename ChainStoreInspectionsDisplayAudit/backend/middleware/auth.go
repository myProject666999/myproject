package middleware

import (
	"net/http"
	"strings"

	"chain-store-inspection/config"
	"chain-store-inspection/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type UserClaims struct {
	UserID   uint64 `json:"userId"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.Response{
				Code:    401,
				Message: "未提供认证令牌",
			})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, models.Response{
				Code:    401,
				Message: "认证令牌格式错误",
			})
			c.Abort()
			return
		}

		tokenStr := parts[1]
		claims := &UserClaims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(config.AppConfig.JWT.SecretKey), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, models.Response{
				Code:    401,
				Message: "认证令牌无效或已过期",
			})
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Set("claims", claims)

		c.Next()
	}
}
