package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"price-monitor/config"
	"price-monitor/database"
	redisclient "price-monitor/redis"
	"price-monitor/router"
	"price-monitor/services"
	"syscall"

	"github.com/gin-gonic/gin"
)

func main() {
	configPath := flag.String("config", "config.yaml", "Path to config file")
	flag.Parse()

	cfg, err := config.LoadConfig(*configPath)
	if err != nil {
		log.Printf("Warning: Could not load config file: %v", err)
		log.Println("Using default configuration")
		cfg = config.GetDefaultConfig()
		config.Cfg = cfg
	}

	_, err = database.InitDatabase(&cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.CloseDatabase()

	_, err = redisclient.InitRedis(&cfg.Redis)
	if err != nil {
		log.Printf("Warning: Could not connect to Redis: %v", err)
		log.Println("Continuing without Redis...")
	}
	defer redisclient.CloseRedis()

	gin.SetMode(cfg.Server.Mode)
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Content-Disposition")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	router.SetupRouter(r)

	scheduler := services.NewSchedulerService()
	scheduler.Start()
	defer scheduler.Stop()

	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Printf("Server starting on %s", addr)

	go func() {
		if err := r.Run(addr); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	scheduler.Stop()
	log.Println("Server stopped")
}
