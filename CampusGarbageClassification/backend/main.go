package main

import (
	"garbage-classification/config"
	"garbage-classification/routes"
	"garbage-classification/utils"
	"log"
)

func main() {
	cfg := config.GetConfig()

	utils.InitDB()
	utils.AutoMigrate()
	utils.SeedData()

	r := routes.SetupRouter()

	log.Printf("Server starting on port %s...", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
