package main

import (
	"log"

	"hospital-medical-record/config"
	"hospital-medical-record/database"
	"hospital-medical-record/routes"
)

func main() {
	config.InitConfig()

	database.InitDB()

	r := routes.SetupRoutes()

	log.Printf("Server starting on port %s...", config.AppConfig.Server.Port)
	if err := r.Run(":" + config.AppConfig.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
