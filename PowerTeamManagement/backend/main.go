package main

import (
	"log"

	"power-team-management/config"
	"power-team-management/database"
	"power-team-management/routes"
)

func main() {
	cfg := config.LoadConfig()

	database.InitDB(cfg)

	r := routes.SetupRouter(cfg)

	log.Printf("Server starting on port %s...", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
