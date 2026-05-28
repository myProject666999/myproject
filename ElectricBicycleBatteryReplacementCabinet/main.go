package main

import (
	"battery-cabinet/config"
	"battery-cabinet/internal/pkg/database"
	"battery-cabinet/internal/router"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.LoadConfig(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if err := database.InitMySQL(); err != nil {
		log.Fatalf("Failed to init MySQL: %v", err)
	}
	log.Println("MySQL connected successfully")

	if err := database.InitRedis(); err != nil {
		log.Printf("Warning: Failed to init Redis: %v", err)
	} else {
		log.Println("Redis connected successfully")
	}

	gin.SetMode(config.AppConfig.Server.Mode)

	r := router.SetupRouter()

	addr := fmt.Sprintf("%s:%d", config.AppConfig.Server.Host, config.AppConfig.Server.Port)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
