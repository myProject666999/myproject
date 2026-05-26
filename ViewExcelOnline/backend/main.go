package main

import (
	"excel-viewer/config"
	"excel-viewer/models"
	"excel-viewer/routes"
	"log"
)

func main() {
	db := config.InitDB()

	err := db.AutoMigrate(&models.ExcelFile{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migration completed")

	r := routes.SetupRouter()

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
