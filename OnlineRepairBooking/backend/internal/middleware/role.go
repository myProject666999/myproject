package middleware

import (
	"online-repair-booking/pkg/response"

	"github.com/labstack/echo/v4"
)

const (
	RoleUser   = 1
	RoleWorker = 2
	RoleAdmin  = 3
)

func RoleAuth(allowedRoles ...int) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			userRole := GetUserRole(c)
			if userRole == 0 {
				return response.Unauthorized(c, "请先登录")
			}

			for _, role := range allowedRoles {
				if userRole == role {
					return next(c)
				}
			}

			return response.Forbidden(c, "权限不足")
		}
	}
}

func UserAuth() echo.MiddlewareFunc {
	return RoleAuth(RoleUser, RoleWorker, RoleAdmin)
}

func WorkerAuth() echo.MiddlewareFunc {
	return RoleAuth(RoleWorker, RoleAdmin)
}

func AdminAuth() echo.MiddlewareFunc {
	return RoleAuth(RoleAdmin)
}

func WorkerOrAdminAuth() echo.MiddlewareFunc {
	return RoleAuth(RoleWorker, RoleAdmin)
}

func UserOrAdminAuth() echo.MiddlewareFunc {
	return RoleAuth(RoleUser, RoleAdmin)
}
