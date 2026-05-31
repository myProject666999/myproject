package main

import (
	"fmt"
	"log"

	"emergency-material/config"
	"emergency-material/internal/database"
	"emergency-material/internal/router"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.LoadConfig("config/config.yaml"); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if err := database.InitMySQL(); err != nil {
		log.Fatalf("Failed to init mysql: %v", err)
	}
	log.Println("MySQL connected successfully")

	if err := database.InitRedis(); err != nil {
		log.Printf("Warning: Redis connection failed: %v", err)
	} else {
		log.Println("Redis connected successfully")
	}

	cfg := config.AppConfig.Server
	if cfg.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	engine := gin.New()
	engine.Use(gin.Recovery())

	router.SetupRouter(engine)

	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Printf("Server starting on %s", addr)
	if err := engine.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
