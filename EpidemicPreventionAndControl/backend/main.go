package main

import (
	"epidemic/config"
	"epidemic/routes"
	"log"
)

func main() {
	config.InitDB()
	config.MigrateDB()
	config.SeedData()

	r := routes.SetupRouter()

	log.Println("Server starting on :8080...")
	log.Println("Admin account: admin / admin123")
	log.Println("Volunteer account: volunteer1 / 123456")

	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
