package main

import (
	"excel-viewer/config"
	"excel-viewer/routes"
	"log"
)

func main() {
	config.InitDB()

	r := routes.SetupRouter()

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
