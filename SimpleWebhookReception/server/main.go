package main

import (
	"log"

	"simple-webhook-reception/config"
	"simple-webhook-reception/database"
	"simple-webhook-reception/handlers"
	"simple-webhook-reception/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.Init(config.AppConfig.Database.Path)

	gin.SetMode(config.AppConfig.Server.Mode)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.SetupRoutes(r)

	go handlers.CleanupExpiredRequests()

	log.Printf("Server starting on %s", config.AppConfig.GetAddr())
	if err := r.Run(config.AppConfig.GetAddr()); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
