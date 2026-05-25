package router

import (
	"price-monitor/handlers"
	"price-monitor/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter(r *gin.Engine) {
	userHandler := &handlers.UserHandler{}
	productHandler := &handlers.ProductHandler{}
	groupHandler := &handlers.GroupHandler{}
	alertHandler := &handlers.AlertHandler{}

	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", userHandler.Login)
			auth.POST("/register", userHandler.Register)
		}

		user := api.Group("/user")
		user.Use(middleware.JWTAuth())
		{
			user.GET("/profile", userHandler.GetProfile)
			user.PUT("/profile", userHandler.UpdateProfile)
			user.PUT("/password", userHandler.ChangePassword)
		}

		groups := api.Group("/groups")
		groups.Use(middleware.JWTAuth())
		{
			groups.POST("", groupHandler.CreateGroup)
			groups.GET("", groupHandler.GetGroups)
			groups.GET("/:id", groupHandler.GetGroup)
			groups.PUT("/:id", groupHandler.UpdateGroup)
			groups.DELETE("/:id", groupHandler.DeleteGroup)
		}

		products := api.Group("/products")
		products.Use(middleware.JWTAuth())
		{
			products.POST("", productHandler.CreateProduct)
			products.GET("", productHandler.GetProducts)
			products.GET("/:id", productHandler.GetProduct)
			products.PUT("/:id", productHandler.UpdateProduct)
			products.DELETE("/:id", productHandler.DeleteProduct)
			products.POST("/:id/favorite", productHandler.ToggleFavorite)
			products.GET("/:id/history", productHandler.GetPriceHistory)
			products.GET("/:id/trend", productHandler.GetPriceTrend)
		}

		alerts := api.Group("/alerts")
		alerts.Use(middleware.JWTAuth())
		{
			alerts.POST("", alertHandler.CreateAlert)
			alerts.GET("", alertHandler.GetAlerts)
			alerts.GET("/:id", alertHandler.GetAlert)
			alerts.PUT("/:id", alertHandler.UpdateAlert)
			alerts.DELETE("/:id", alertHandler.DeleteAlert)
			alerts.GET("/logs/list", alertHandler.GetAlertLogs)
			alerts.PUT("/logs/:id/read", alertHandler.MarkAsRead)
			alerts.PUT("/logs/read-all", alertHandler.MarkAllAsRead)
			alerts.GET("/logs/unread-count", alertHandler.GetUnreadCount)
		}
	}
}
