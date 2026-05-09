package main

import (
	"english-learning/config"
	"english-learning/database"
	"english-learning/routes"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	database.InitDB()

	router := gin.Default()
	routes.SetupRoutes(router)

	log.Println("Server starting on port " + cfg.ServerPort)
	log.Println("Database: english_learning.db")
	log.Println("Default admin: admin@example.com / admin123")
	
	if err := router.Run(cfg.ServerPort); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
