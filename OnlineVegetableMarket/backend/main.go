package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"

	"vegetable-market/config"
	"vegetable-market/routes"
)

func main() {
	_ = godotenv.Load()

	config.Init()

	app := fiber.New(fiber.Config{
		BodyLimit: 10 * 1024 * 1024,
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))

	app.Use(logger.New())
	app.Use(recover.New())

	routes.SetupRoutes(app)

	log.Println("Server starting on :8088")
	log.Fatal(app.Listen(":8088"))
}
