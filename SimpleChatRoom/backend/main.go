package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"simple-chat-room/config"
	"simple-chat-room/handlers"
	"simple-chat-room/websocket"
)

func main() {
	config.InitDB()
	defer config.CloseDB()

	var roomCount int
	err := config.DB.QueryRow("SELECT COUNT(*) FROM rooms").Scan(&roomCount)
	if err != nil {
		log.Fatalf("Failed to test database query: %v", err)
	}
	log.Printf("Database test passed. Found %d rooms", roomCount)

	hub := websocket.NewHub()
	go hub.Run()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			return true
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.Static("/uploads", "./uploads")

	api := r.Group("/api")
	{
		api.GET("/rooms", handlers.ListRooms)
		api.POST("/rooms", handlers.CreateRoom)
		api.DELETE("/rooms/:id", handlers.DestroyRoom)
		api.GET("/rooms/:id/messages", handlers.GetMessages)
		api.POST("/upload", handlers.UploadImage)
	}

	r.GET("/ws/:roomId", hub.HandleWebSocket)

	go func() {
		if err := r.Run(":8080"); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	log.Println("Server started on :8080")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
}
