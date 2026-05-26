package router

import (
	"github.com/gin-gonic/gin"

	"github.com/onlinemall/backend/internal/handler"
	"github.com/onlinemall/backend/internal/middleware"
)

func SetupRouter(
	userHandler *handler.UserHandler,
	productHandler *handler.ProductHandler,
	orderHandler *handler.OrderHandler,
	adminHandler *handler.AdminHandler,
) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(middleware.RecoveryWithLog())

	r.Use(middleware.CORS())
	r.Use(middleware.Auth())
	r.Use(middleware.RequestLogger())

	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		products := api.Group("/products")
		{
			products.GET("", productHandler.ListProducts)
			products.GET("/categories", productHandler.ListCategories)
			products.GET("/:id", productHandler.GetProduct)
		}

		user := api.Group("/user")
		{
			user.GET("/points", userHandler.GetPointsAccount)
			user.GET("/points/details", userHandler.ListPointsDetails)
			user.POST("/points/earn", userHandler.EarnPoints)
			user.GET("/ranking", userHandler.GetRanking)
		}

		orders := api.Group("/orders")
		{
			orders.POST("", orderHandler.CreateOrder)
			orders.GET("", orderHandler.ListUserOrders)
			orders.GET("/:id", orderHandler.GetOrder)
			orders.POST("/cancel", orderHandler.CancelOrder)
		}

		admin := api.Group("/admin")
		{
			admin.GET("/orders", adminHandler.ListOrders)
			admin.POST("/orders/ship", adminHandler.ShipOrder)
			admin.POST("/orders/complete", adminHandler.CompleteOrder)
		}
	}

	return r
}
