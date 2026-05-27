package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"portfolio/config"
	"portfolio/database"
	"portfolio/routes"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	if err := config.Init(); err != nil {
		log.Fatalf("Failed to initialize config: %v", err)
	}

	if err := database.Init(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	if err := os.MkdirAll(config.App.UploadDir, 0755); err != nil {
		log.Fatalf("Failed to create upload directory: %v", err)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.Static("/uploads", config.App.UploadDir)

	routes.Setup(r)

	log.Printf("Server starting on port %s", config.App.Port)
	if err := r.Run(":" + config.App.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
