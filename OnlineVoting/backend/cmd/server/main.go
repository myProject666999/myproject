package main

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"

	"online-voting/config"
	"online-voting/internal/database"
	"online-voting/internal/handler"
	"online-voting/internal/middleware"
	red "online-voting/internal/redis"
	"online-voting/internal/route"
)

func main() {
	_ = godotenv.Load()
	cfg := config.Load()

	middleware.SetSecret(cfg.AppSecret)

	database.Init(cfg)
	red.Init(cfg)
	database.Seed()

	app := fiber.New(fiber.Config{
		AppName:      "Online Voting & Lottery",
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000,http://127.0.0.1:3000",
		AllowCredentials: true,
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
	}))
	app.Use(logger.New())
	app.Use(recover.New())

	route.Register(app)

	// 定时任务：每 5 分钟同步 Redis 票数到 DB
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			handler.SyncVoteCountToDB()
		}
	}()

	// 启动时预热缓存
	go handler.WarmUpAllActivities()

	log.Printf("Server running at http://127.0.0.1:%s", cfg.AppPort)
	if err := app.Listen(":" + cfg.AppPort); err != nil {
		log.Fatal(err)
	}
}
