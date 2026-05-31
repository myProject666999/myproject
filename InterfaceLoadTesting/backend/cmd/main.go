package main

import (
	"load-testing/config"
	"load-testing/internal/handler"
	"load-testing/internal/middleware"
	"load-testing/internal/repository"
	"load-testing/pkg/loadtest"
	"load-testing/pkg/logger"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()
	logger.InitLogger()

	if err := repository.InitDB(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := repository.InitRedis(); err != nil {
		log.Printf("Warning: Failed to connect to Redis: %v", err)
	}

	loadtest.InitTaskManager()

	gin.SetMode(config.AppConfig.Server.Mode)
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	setupRoutes(r)

	logger.Infof("Server starting on port %s", config.AppConfig.Server.Port)
	if err := r.Run(":" + config.AppConfig.Server.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func setupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", handler.Login)
			auth.GET("/user", middleware.JWTAuth(), handler.GetCurrentUser)
		}

		targets := api.Group("/targets")
		targets.Use(middleware.JWTAuth())
		{
			targets.POST("", handler.CreateTarget)
			targets.GET("", handler.GetTargetList)
			targets.GET("/:id", handler.GetTarget)
			targets.PUT("/:id", handler.UpdateTarget)
			targets.DELETE("/:id", handler.DeleteTarget)
		}

		tasks := api.Group("/tasks")
		tasks.Use(middleware.JWTAuth())
		{
			tasks.POST("", handler.CreateTask)
			tasks.GET("", handler.GetTaskList)
			tasks.GET("/:id", handler.GetTask)
			tasks.POST("/:id/start", handler.StartTask)
			tasks.POST("/:id/stop", handler.StopTask)
			tasks.DELETE("/:id", handler.DeleteTask)
		}

		metrics := api.Group("/metrics")
		metrics.Use(middleware.JWTAuth())
		{
			metrics.GET("/task/:id", handler.GetTaskMetrics)
			metrics.GET("/task/:id/history", handler.GetTaskMetricsHistory)
		}

		reports := api.Group("/reports")
		reports.Use(middleware.JWTAuth())
		{
			reports.GET("", handler.GetReportList)
			reports.GET("/:id", handler.GetReport)
			reports.GET("/task/:task_id", handler.GetReportByTaskID)
			reports.DELETE("/:id", handler.DeleteReport)
		}

		baselines := api.Group("/baselines")
		baselines.Use(middleware.JWTAuth())
		{
			baselines.POST("", handler.CreateBaseline)
			baselines.GET("", handler.GetBaselineList)
			baselines.GET("/:id", handler.GetBaseline)
			baselines.PUT("/:id", handler.UpdateBaseline)
			baselines.DELETE("/:id", handler.DeleteBaseline)
		}

		comparisons := api.Group("/comparisons")
		comparisons.Use(middleware.JWTAuth())
		{
			comparisons.POST("", handler.CompareWithBaseline)
			comparisons.GET("", handler.GetComparisonList)
		}

		alarms := api.Group("/alarms")
		alarms.Use(middleware.JWTAuth())
		{
			alarms.GET("", handler.GetAlarmList)
			alarms.POST("/:id/handle", handler.HandleAlarm)
		}
	}
}
