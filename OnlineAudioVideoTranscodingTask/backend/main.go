package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"transcoding-service/config"
	"transcoding-service/handlers"
	"transcoding-service/middleware"
	"transcoding-service/models"
	"transcoding-service/services"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	cfg := config.Load()

	os.MkdirAll(cfg.UploadDir, 0755)
	os.MkdirAll(cfg.OutputDir, 0755)

	db, err := gorm.Open(mysql.Open(cfg.MySQLDSN), &gorm.Config{})
	if err != nil {
		log.Fatalf("连接MySQL失败: %v", err)
	}
	log.Println("MySQL连接成功")

	db.AutoMigrate(&models.Task{}, &models.TaskHistory{})

	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPass,
		DB:       cfg.RedisDB,
	})
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		log.Printf("Redis连接失败(将不使用队列功能): %v", err)
	} else {
		log.Println("Redis连接成功")
	}

	ffmpegSvc := services.NewFFmpegService(db, cfg.FFmpegPath)
	queueSvc := services.NewQueueService(db, rdb, ffmpegSvc, cfg.OutputDir)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	queueSvc.StartWorkers(ctx)

	uploadHandler := handlers.NewUploadHandler(db, queueSvc, cfg.UploadDir)

	r := gin.Default()
	r.Use(middleware.CORS())

	r.Static("/static", "./outputs")

	api := r.Group("/api")
	{
		api.POST("/upload", uploadHandler.Upload)
		api.GET("/tasks", uploadHandler.ListTasks)
		api.GET("/tasks/:id", uploadHandler.GetTask)
		api.DELETE("/tasks/:id", uploadHandler.DeleteTask)
		api.GET("/tasks/:id/download", uploadHandler.Download)
	}

	go func() {
		addr := ":" + cfg.ServerPort
		log.Printf("服务启动，监听端口 %s", addr)
		if err := r.Run(addr); err != nil {
			log.Fatalf("服务启动失败: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("正在关闭服务...")
	cancel()
	rdb.Close()
	log.Println("服务已关闭")
}
