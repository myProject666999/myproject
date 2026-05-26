package routes

import (
	"online-repair-booking/internal/handlers"
	"online-repair-booking/internal/middleware"
	"online-repair-booking/pkg/database"

	"github.com/labstack/echo/v4"
)

func RegisterPaymentRoutes(g *echo.Group) {
	db := database.MySQL
	paymentHandler := handlers.NewPaymentHandler(db)

	paymentGroup := g.Group("/payments")
	{
		paymentGroup.GET("/status", paymentHandler.GetPaymentStatus, middleware.JWTAuth(), middleware.UserAuth())
		paymentGroup.POST("", paymentHandler.CreatePayment, middleware.JWTAuth(), middleware.UserAuth())
		paymentGroup.POST("/process", paymentHandler.ProcessPayment, middleware.JWTAuth(), middleware.UserAuth())
	}
}
