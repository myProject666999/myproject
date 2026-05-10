package main

import (
	"emergency-mutual-aid/config"
	"emergency-mutual-aid/database"
	"emergency-mutual-aid/routes"
	"log"
)

func main() {
	database.InitDB()
	r := routes.SetupRouter()

	cfg := config.LoadConfig()
	log.Printf("Server starting on port %s", cfg.Port)
	
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
