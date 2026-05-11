package main

import (
	"log"

	"examination-registration/config"
	"examination-registration/database"
	"examination-registration/routes"
)

func main() {
	config.LoadConfig()
	database.Connect()

	r := routes.SetupRouter()

	port := config.AppConfig.ServerPort
	log.Printf("Server starting on port " + port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
