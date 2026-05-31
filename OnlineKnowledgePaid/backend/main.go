package main

import (
	"fmt"
	"log"

	"online-knowledge-paid/config"
	"online-knowledge-paid/pkg/redis"
	"online-knowledge-paid/router"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	cfg := config.Load()

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DB.User, cfg.DB.Password, cfg.DB.Host, cfg.DB.Port, cfg.DB.DBName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database")
	}
	log.Println("Database connected successfully")

	redis.InitRedis(cfg.Redis.Host, cfg.Redis.Port, cfg.Redis.Password, cfg.Redis.DB)
	defer redis.Close()

	r := router.SetupRouter(db, cfg.JWT.Secret)

	log.Printf("Server starting on port %s", cfg.Server.Port)
	r.Run(":" + cfg.Server.Port)
}