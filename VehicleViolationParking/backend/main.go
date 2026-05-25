package main

import (
	"fmt"
	"log"

	"vehicle-parking/backend/config"
	"vehicle-parking/backend/router"
	"vehicle-parking/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	cfg := config.LoadConfig()

	gin.SetMode(cfg.Server.Mode)

	db, err := gorm.Open(mysql.Open(cfg.Database.DSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	fmt.Println("Database connected successfully")

	utils.InitRedis(cfg.Redis)
	if utils.RedisClient != nil {
		fmt.Println("Redis connected successfully")
	} else {
		fmt.Println("Warning: Redis not available, caching disabled")
	}

	r := router.SetupRouter(db, cfg)

	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	fmt.Printf("Server starting on http://127.0.0.1%s\n", addr)

	if err := r.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
