package main

import (
	"log"
	"time"

	"group-buying/config"
	"group-buying/handlers"
	"group-buying/router"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()
	config.InitDB(cfg.MySQLDSN)
	config.InitRedis(cfg.RedisAddr, cfg.RedisPassword, cfg.RedisDB)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.SetupRoutes(r)

	go startExpireChecker()

	log.Println("服务器启动成功，监听端口" + cfg.ServerPort)
	if err := r.Run(cfg.ServerPort); err != nil {
		log.Fatal("服务器启动失败: ", err)
	}
}

func startExpireChecker() {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		handlers.CheckExpireGroups()
	}
}
