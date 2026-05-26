package middleware

import (
	"strings"

	"online-repair-booking/pkg/response"
	"online-repair-booking/pkg/utils"

	"github.com/labstack/echo/v4"
)

type contextKey string

const (
	UserIDKey contextKey = "user_id"
	RoleKey   contextKey = "role"
)

func JWTAuth() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return response.Unauthorized(c, "未提供认证令牌")
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || parts[0] != "Bearer" {
				return response.Unauthorized(c, "认证令牌格式错误")
			}

			tokenString := parts[1]
			claims, err := utils.ParseToken(tokenString)
			if err != nil {
				return response.Unauthorized(c, "认证令牌无效或已过期")
			}

			c.Set(string(UserIDKey), claims.UserID)
			c.Set(string(RoleKey), claims.Role)

			return next(c)
		}
	}
}

func GetUserID(c echo.Context) uint64 {
	userID, ok := c.Get(string(UserIDKey)).(uint64)
	if !ok {
		return 0
	}
	return userID
}

func GetUserRole(c echo.Context) int {
	role, ok := c.Get(string(RoleKey)).(int)
	if !ok {
		return 0
	}
	return role
}

func OptionalJWTAuth() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return next(c)
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || parts[0] != "Bearer" {
				return next(c)
			}

			tokenString := parts[1]
			claims, err := utils.ParseToken(tokenString)
			if err != nil {
				return next(c)
			}

			c.Set(string(UserIDKey), claims.UserID)
			c.Set(string(RoleKey), claims.Role)

			return next(c)
		}
	}
}
