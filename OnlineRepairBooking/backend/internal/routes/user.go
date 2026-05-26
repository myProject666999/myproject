package routes

import (
	"online-repair-booking/internal/handlers"
	"online-repair-booking/internal/middleware"
	"online-repair-booking/pkg/database"

	"github.com/labstack/echo/v4"
)

func RegisterUserRoutes(api *echo.Group) {
	db := database.MySQL
	userHandler := handlers.NewUserHandler(db)
	addressHandler := handlers.NewAddressHandler(db)

	api.POST("/auth/register", userHandler.Register)
	api.POST("/auth/login", userHandler.Login)

	user := api.Group("/user")
	user.Use(middleware.JWTAuth())
	{
		user.GET("/profile", userHandler.GetProfile)
		user.PUT("/profile", userHandler.UpdateProfile)

		user.POST("/addresses", addressHandler.CreateAddress)
		user.GET("/addresses", addressHandler.GetAddressList)
		user.PUT("/addresses/:id", addressHandler.UpdateAddress)
		user.DELETE("/addresses/:id", addressHandler.DeleteAddress)
		user.POST("/addresses/:id/default", addressHandler.SetDefaultAddress)
	}
}
