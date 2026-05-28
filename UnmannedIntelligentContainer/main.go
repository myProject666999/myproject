package main

import (
	"log"

	"unmanned-container/config"
	"unmanned-container/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()

	gin.SetMode(config.AppConfig.Server.Mode)

	config.InitMySQL()
	config.InitRedis()

	r := gin.Default()

	routes.SetupRoutes(r)

	log.Printf("Server starting on port %s", config.AppConfig.Server.Port)
	if err := r.Run(":" + config.AppConfig.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
