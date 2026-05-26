package main

import (
	"fmt"
	"log"
	"net/http"

	"barrage_interaction/config"
	"barrage_interaction/handlers"
	"barrage_interaction/middleware"
	"barrage_interaction/models"
	"barrage_interaction/websocket"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()

	if err := models.InitDB(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer models.CloseDB()

	models.AutoMigrate()

	redisClient := config.NewRedisClient()
	defer redisClient.Close()

	handlers.StartRedisSubscriber()

	hub := websocket.NewHub(redisClient)
	go hub.Run()

	router := gin.Default()

	router.Use(middleware.CORSMiddleware())

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Barrage Interaction Server",
		})
	})

	api := router.Group("/api")
	{
		api.POST("/register", handlers.Register)
		api.POST("/login", handlers.Login)
		api.POST("/admin/login", handlers.AdminLogin)

		messages := api.Group("/messages")
		{
			messages.POST("", middleware.RateLimiterMiddleware(), handlers.CreateMessage)
			messages.GET("", handlers.GetMessages)
			messages.GET("/pending", middleware.AdminAuthMiddleware(), handlers.GetPendingMessages)
			messages.PUT("/:id/approve", middleware.AdminAuthMiddleware(), handlers.ApproveMessage)
			messages.PUT("/:id/reject", middleware.AdminAuthMiddleware(), handlers.RejectMessage)
		}

		likes := api.Group("/likes")
		{
			likes.POST("/:message_id", handlers.LikeMessage)
			likes.DELETE("/:message_id", handlers.UnlikeMessage)
		}

		lottery := api.Group("/lottery")
		{
			lottery.POST("", middleware.AdminAuthMiddleware(), handlers.CreateLottery)
			lottery.GET("", handlers.GetLotteries)
			lottery.GET("/:id", handlers.GetLottery)
			lottery.POST("/:id/draw", middleware.AdminAuthMiddleware(), handlers.DrawWinners)
			lottery.GET("/:id/winners", handlers.GetWinners)
		}

		users := api.Group("/users")
		{
			users.GET("", handlers.GetUsers)
		}
	}

	router.GET("/ws", func(c *gin.Context) {
		websocket.HandleWebSocket(hub, c)
	})

	port := config.AppConfig.Server.Port
	log.Printf("Server starting on port %d", port)
	if err := router.Run(fmt.Sprintf(":%d", port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
