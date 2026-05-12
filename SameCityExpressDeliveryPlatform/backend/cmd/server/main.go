package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"

	"samecity-express/config"
	"samecity-express/internal/handler"
	"samecity-express/internal/middleware"
	"samecity-express/websocket"
)

func main() {
	config.InitConfig()
	config.InitDatabase()

	go websocket.GetHub().Run()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	userHandler := handler.NewUserHandler()
	riderHandler := handler.NewRiderHandler()
	orderHandler := handler.NewOrderHandler()
	addressHandler := handler.NewAddressHandler()
	exceptionHandler := handler.NewExceptionHandler()
	adminHandler := handler.NewAdminHandler()

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "同城速运配送平台 API",
			"version": "1.0.0",
		})
	})

	r.GET("/ws", websocket.HandleWebSocket)

	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/user/register", userHandler.Register)
			auth.POST("/user/login", userHandler.Login)
			auth.POST("/rider/register", riderHandler.Register)
			auth.POST("/rider/login", riderHandler.Login)
			auth.POST("/admin/login", adminHandler.Login)
		}

		user := api.Group("/user")
		user.Use(middleware.JWTAuth(), middleware.UserAuth())
		{
			user.GET("/profile", userHandler.GetProfile)
			user.PUT("/profile", userHandler.UpdateProfile)
			user.POST("/change-password", userHandler.ChangePassword)

			address := user.Group("/address")
			{
				address.GET("", addressHandler.GetAddresses)
				address.GET("/default", addressHandler.GetDefaultAddress)
				address.POST("", addressHandler.CreateAddress)
				address.PUT("", addressHandler.UpdateAddress)
				address.DELETE("/:id", addressHandler.DeleteAddress)
				address.POST("/set-default", addressHandler.SetDefaultAddress)
			}

			order := user.Group("/order")
			{
				order.POST("/calculate-price", orderHandler.CalculatePrice)
				order.POST("", orderHandler.CreateOrder)
				order.GET("", orderHandler.GetUserOrders)
				order.GET("/:id", orderHandler.GetOrder)
				order.POST("/cancel", orderHandler.CancelOrder)
				order.POST("/rate", orderHandler.RateOrder)
				order.GET("/:id/tracks", orderHandler.GetOrderTracks)
			}

			exception := user.Group("/exception")
			{
				exception.GET("", exceptionHandler.GetUserExceptions)
				exception.POST("", exceptionHandler.CreateException)
				exception.GET("/:id", exceptionHandler.GetException)
			}
		}

		rider := api.Group("/rider")
		rider.Use(middleware.JWTAuth(), middleware.RiderAuth())
		{
			rider.GET("/profile", riderHandler.GetProfile)
			rider.POST("/update-location", riderHandler.UpdateLocation)
			rider.POST("/online-status", riderHandler.UpdateOnlineStatus)

			order := rider.Group("/order")
			{
				order.GET("/available", orderHandler.GetAvailableOrders)
				order.GET("", orderHandler.GetRiderOrders)
				order.GET("/:id", orderHandler.GetOrder)
				order.POST("/accept", orderHandler.AcceptOrder)
				order.POST("/pickup", orderHandler.PickupOrder)
				order.POST("/deliver", orderHandler.DeliverOrder)
				order.GET("/:id/tracks", orderHandler.GetOrderTracks)
			}

			exception := rider.Group("/exception")
			{
				exception.GET("", exceptionHandler.GetRiderExceptions)
				exception.GET("/:id", exceptionHandler.GetException)
			}
		}

		admin := api.Group("/admin")
		admin.Use(middleware.JWTAuth(), middleware.AdminAuth())
		{
			admin.GET("/orders", adminHandler.GetOrders)
			admin.GET("/users", adminHandler.GetUsers)
			admin.GET("/riders", adminHandler.GetRiders)
			admin.PUT("/riders/:id/status", adminHandler.UpdateRiderStatus)
			admin.GET("/pricing", adminHandler.GetPricingRules)
			admin.PUT("/pricing/:id", adminHandler.UpdatePricingRule)

			exception := admin.Group("/exception")
			{
				exception.GET("", exceptionHandler.GetAllExceptions)
				exception.GET("/:id", exceptionHandler.GetException)
				exception.PUT("/:id/handle", exceptionHandler.HandleException)
			}
		}
	}

	port := viper.GetString("server.port")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
