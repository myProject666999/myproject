package main

import (
	"chain-store-inspection/config"
	"chain-store-inspection/database"
	"chain-store-inspection/router"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDB()

	uploadDir := config.AppConfig.Upload.PhotoPath
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Fatalf("Failed to create upload directory: %v", err)
	}
	log.Printf("Upload directory initialized: %s", uploadDir)

	r := gin.Default()

	router.SetupRouter(r)

	addr := config.AppConfig.Server.Host + ":" + config.AppConfig.Server.Port
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
