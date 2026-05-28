package middleware

import (
	"carpooling/config"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(userID uint64, phone string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"phone":   phone,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.AppConfig.JWT.Secret))
}

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "缺少认证信息",
			})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "认证格式错误",
			})
			c.Abort()
			return
		}

		tokenStr := parts[1]
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			return []byte(config.AppConfig.JWT.Secret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "认证信息无效或已过期",
			})
			c.Abort()
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			userID := uint64(0)
			if v, ok := claims["user_id"]; ok {
				if val, ok := v.(float64); ok {
					userID = uint64(val)
				}
			}
			phone := ""
			if v, ok := claims["phone"]; ok {
				phone, _ = v.(string)
			}
			c.Set("user_id", userID)
			c.Set("phone", phone)
		}

		c.Next()
	}
}

func GetUserID(c *gin.Context) uint64 {
	if v, exists := c.Get("user_id"); exists {
		if id, ok := v.(uint64); ok {
			return id
		}
	}
	return 0
}

func GetPhone(c *gin.Context) string {
	if v, exists := c.Get("phone"); exists {
		if phone, ok := v.(string); ok {
			return phone
		}
	}
	return ""
}
