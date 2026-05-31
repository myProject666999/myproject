package main

import (
	"log"
	"shuttle-booking/config"
	"shuttle-booking/database"
	"shuttle-booking/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()
	gin.SetMode(cfg.App.Mode)

	database.InitMySQL()
	database.InitRedis()

	r := gin.Default()

	routes.SetupRoutes(r)

	log.Printf("Server starting on port %s...", cfg.App.Port)
	r.Run(":" + cfg.App.Port)
}
