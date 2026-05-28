package main

import (
	"fmt"
	"log"

	"air-quality-dashboard/internal/cache"
	"air-quality-dashboard/internal/config"
	"air-quality-dashboard/internal/database"
	"air-quality-dashboard/internal/routes"
	"air-quality-dashboard/internal/scheduler"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	cfg := config.Load()

	database.Connect(cfg)
	defer database.Close()

	redisCache := cache.New(cfg)
	if redisCache != nil {
		defer redisCache.Close()
	}

	app := fiber.New(fiber.Config{
		AppName: "Air Quality Dashboard API",
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	app.Use(logger.New())

	routes.SetupRoutes(app)

	sched := scheduler.NewScheduler()
	go sched.Start()

	port := ":" + cfg.ServerPort
	fmt.Printf("Server starting on port %s...\n", port)
	log.Fatal(app.Listen(port))
}
