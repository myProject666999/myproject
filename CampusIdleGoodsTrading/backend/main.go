package main

import (
	"campus-trading/config"
	"campus-trading/data"
	"campus-trading/middleware"
	"campus-trading/routes"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	err = config.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := config.MigrateDB(); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	if err := data.InitSeedData(); err != nil {
		log.Printf("Warning: Failed to seed data: %v", err)
	} else {
		log.Println("Database seed data initialized successfully")
	}

	r := gin.Default()

	r.Use(middleware.CORS())

	routes.SetupRoutes(r)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	address := ":" + cfg.Port
	log.Printf("Server starting on port %s...", cfg.Port)
	if err := r.Run(address); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
