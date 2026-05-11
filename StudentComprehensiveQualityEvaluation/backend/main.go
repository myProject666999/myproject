package main

import (
	"log"
	"student_quality_system/config"
	"student_quality_system/routes"
)

func main() {
	cfg := config.LoadConfig()
	
	config.InitDB()
	
	r := routes.SetupRouter()
	
	log.Printf("Server starting on port %s...", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
