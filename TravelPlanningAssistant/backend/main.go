package main

import (
	"log"
	"travelplanner/database"
	"travelplanner/middleware"
	"travelplanner/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	database.Init()

	r := gin.Default()

	r.Use(middleware.CORSMiddleware())

	routes.SetupRoutes(r)

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
