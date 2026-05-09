package main

import (
	"log"
	"online-job-recruitment/config"
	"online-job-recruitment/database"
	"online-job-recruitment/routes"
)

func main() {
	config.LoadConfig()

	database.Connect()
	database.AutoMigrate()
	database.SeedData()

	r := routes.SetupRoutes()

	log.Printf("Server starting on port %s...", config.AppConfig.Port)
	if err := r.Run(":" + config.AppConfig.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
