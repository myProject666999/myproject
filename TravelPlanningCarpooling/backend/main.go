package main

import (
	"carpooling/config"
	"carpooling/internal/handler"
	"carpooling/internal/middleware"
	"carpooling/pkg/database"
	redisPkg "carpooling/pkg/redis"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.Load("config/config.yaml"); err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	if err := database.Init(); err != nil {
		log.Fatalf("连接MySQL失败: %v", err)
	}

	if err := redisPkg.Init(); err != nil {
		log.Fatalf("连接Redis失败: %v", err)
	}

	gin.SetMode(config.AppConfig.Server.Mode)
	r := gin.Default()

	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	authHandler := handler.NewAuthHandler()
	rideHandler := handler.NewRideHandler()
	requestHandler := handler.NewRequestHandler()
	orderHandler := handler.NewOrderHandler()
	locationHandler := handler.NewLocationHandler()
	reviewHandler := handler.NewReviewHandler()
	vehicleHandler := handler.NewVehicleHandler()

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/profile", middleware.JWTAuth(), authHandler.GetProfile)
		}

		rides := api.Group("/rides")
		{
			rides.POST("", middleware.JWTAuth(), rideHandler.Create)
			rides.GET("", rideHandler.List)
			rides.GET("/nearby", rideHandler.GetNearby)
			rides.GET("/:id", rideHandler.Get)
			rides.PUT("/:id/status", middleware.JWTAuth(), rideHandler.UpdateStatus)
		}

		requests := api.Group("/requests")
		{
			requests.POST("", middleware.JWTAuth(), requestHandler.Create)
			requests.GET("", middleware.JWTAuth(), requestHandler.List)
			requests.GET("/:id", requestHandler.Get)
			requests.GET("/:id/matches", middleware.JWTAuth(), requestHandler.GetMatches)
		}

		orders := api.Group("/orders")
		{
			orders.POST("", middleware.JWTAuth(), orderHandler.Create)
			orders.GET("", middleware.JWTAuth(), orderHandler.List)
			orders.GET("/:id", orderHandler.Get)
			orders.PUT("/:id/confirm", middleware.JWTAuth(), orderHandler.Confirm)
			orders.PUT("/:id/reject", middleware.JWTAuth(), orderHandler.Reject)
			orders.PUT("/:id/start", middleware.JWTAuth(), orderHandler.Start)
			orders.PUT("/:id/complete", middleware.JWTAuth(), orderHandler.Complete)
			orders.PUT("/:id/cancel", middleware.JWTAuth(), orderHandler.Cancel)
		}

		locations := api.Group("/locations")
		{
			locations.POST("", middleware.JWTAuth(), locationHandler.Report)
			locations.GET("/:ride_id", middleware.JWTAuth(), locationHandler.GetRideLocations)
		}

		reviews := api.Group("/reviews")
		{
			reviews.POST("", middleware.JWTAuth(), reviewHandler.Create)
			reviews.GET("/user/:user_id", reviewHandler.GetUserReviews)
		}

		vehicles := api.Group("/vehicles")
		{
			vehicles.POST("", middleware.JWTAuth(), vehicleHandler.Create)
			vehicles.GET("", middleware.JWTAuth(), vehicleHandler.List)
			vehicles.GET("/:id", vehicleHandler.Get)
			vehicles.PUT("/:id", middleware.JWTAuth(), vehicleHandler.Update)
			vehicles.DELETE("/:id", middleware.JWTAuth(), vehicleHandler.Delete)
		}
	}

	addr := fmt.Sprintf(":%s", config.AppConfig.Server.Port)
	log.Printf("服务启动于 %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("服务启动失败: %v", err)
	}
}
