package main

import (
	"fmt"
	"log"
	"offlinedownloader/app/routes"
	"offlinedownloader/app/services"
	"offlinedownloader/config"
	"offlinedownloader/database"
)

func main() {
	log.Println("Starting Offline Downloader Server...")

	config.LoadConfig()
	log.Println("Configuration loaded")

	database.InitDB()
	database.AutoMigrate()
	log.Println("Database initialized")

	services.InitAria2()
	log.Println("Aria2 client initialized")

	downloadService := services.NewDownloadService()
	downloadService.StartStatusMonitor()
	log.Println("Status monitor started")

	fileService := services.NewFileService()
	fileService.StartDirectoryScanner()
	log.Println("Directory scanner started")

	r := routes.SetupRoutes()

	addr := fmt.Sprintf("%s:%d", config.AppConfig.ServerHost, config.AppConfig.ServerPort)
	log.Printf("Server starting on %s", addr)
	log.Printf("API Documentation:")
	log.Printf("  GET  /health - Health check")
	log.Printf("  POST /api/tasks - Add download task")
	log.Printf("  GET  /api/tasks - List download tasks")
	log.Printf("  GET  /api/files - List files")
	log.Printf("  GET  /api/files/:id/play - Play file")

	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
