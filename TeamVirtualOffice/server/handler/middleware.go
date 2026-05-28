package handler

import (
	"strings"
	"team-virtual-office/model"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(401, model.Response{Code: 401, Message: "missing authorization header"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(401, model.Response{Code: 401, Message: "invalid authorization format"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims := &jwt.RegisteredClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(configInstance.JWT.Secret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(401, model.Response{Code: 401, Message: "invalid token"})
			c.Abort()
			return
		}

		userID := claims.Subject
		if userID == "" {
			c.JSON(401, model.Response{Code: 401, Message: "invalid token claims"})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}
