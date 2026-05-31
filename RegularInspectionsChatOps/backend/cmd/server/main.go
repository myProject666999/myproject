package main

import (
	"fmt"
	"inspection-chatops/configs"
	"inspection-chatops/internal/api"
	"inspection-chatops/internal/middleware"
	"inspection-chatops/internal/scheduler"
	"inspection-chatops/pkg/logger"
	"inspection-chatops/pkg/mysql"
	"inspection-chatops/pkg/redis"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	if err := configs.LoadConfig("configs/config.yaml"); err != nil {
		panic("load config failed: " + err.Error())
	}

	if err := logger.Init(); err != nil {
		panic("init logger failed: " + err.Error())
	}
	defer logger.Sync()

	if err := mysql.Init(); err != nil {
		logger.Fatal("init mysql failed", zap.Error(err))
	}

	if err := redis.Init(); err != nil {
		logger.Fatal("init redis failed", zap.Error(err))
	}

	taskScheduler := scheduler.NewTaskScheduler()
	go taskScheduler.Start()
	defer taskScheduler.Stop()

	gin.SetMode(configs.AppConfig.Server.Mode)
	r := gin.Default()

	r.Use(middleware.CORS())

	authHandler := api.NewAuthHandler()
	inspectionHandler := api.NewInspectionHandler()
	robotHandler := api.NewRobotHandler()

	apiV1 := r.Group("/api/v1")
	{
		apiV1.POST("/auth/login", authHandler.Login)

		auth := apiV1.Group("")
		auth.Use(middleware.JWTAuth())
		{
			auth.GET("/auth/profile", authHandler.GetProfile)

			tasks := auth.Group("/tasks")
			{
				tasks.POST("", inspectionHandler.CreateTask)
				tasks.GET("", inspectionHandler.ListTasks)
				tasks.GET("/:id", inspectionHandler.GetTask)
				tasks.PUT("/:id", inspectionHandler.UpdateTask)
				tasks.DELETE("/:id", inspectionHandler.DeleteTask)
				tasks.POST("/:id/execute", inspectionHandler.ExecuteTask)
			}

			results := auth.Group("/results")
			{
				results.GET("", inspectionHandler.ListResults)
				results.GET("/:id", inspectionHandler.GetResult)
			}

			robots := auth.Group("/robots")
			{
				robots.POST("", robotHandler.CreateRobot)
				robots.GET("", robotHandler.ListRobots)
				robots.GET("/:id", robotHandler.GetRobot)
				robots.PUT("/:id", robotHandler.UpdateRobot)
				robots.DELETE("/:id", robotHandler.DeleteRobot)
			}

			plans := auth.Group("/plans")
			{
				plans.POST("", robotHandler.CreatePlan)
				plans.GET("", robotHandler.ListPlans)
				plans.GET("/:id", robotHandler.GetPlan)
				plans.PUT("/:id", robotHandler.UpdatePlan)
				plans.DELETE("/:id", robotHandler.DeletePlan)
			}

			auth.POST("/commands/execute", robotHandler.ExecuteCommand)

			audit := auth.Group("/audit")
			{
				audit.GET("", robotHandler.ListAudit)
			}
		}
	}

	go func() {
		addr := fmt.Sprintf(":%d", configs.AppConfig.Server.Port)
		logger.Info("server starting", zap.String("addr", addr))
		if err := r.Run(addr); err != nil {
			logger.Fatal("server run failed", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("server shutdown")
}
