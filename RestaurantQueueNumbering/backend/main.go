package main

import (
	"log"
	"restaurant-queue/config"
	"restaurant-queue/database"
	"restaurant-queue/router"
	"restaurant-queue/websocket"
)

func main() {
	if err := config.LoadConfig(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if err := database.InitMySQL(); err != nil {
		log.Fatalf("Failed to connect to MySQL: %v", err)
	}
	defer database.CloseMySQL()

	if err := database.InitRedis(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer database.CloseRedis()

	websocket.InitWebSocket()

	r := router.SetupRouter()

	log.Printf("Server starting on %s", config.AppConfig.Server.Addr())
	if err := r.Run(config.AppConfig.Server.Addr()); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
