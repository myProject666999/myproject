package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"

	"websitespeedtest/db"
	"websitespeedtest/handler"
	"websitespeedtest/service"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	db.Init()

	service.GlobalScheduler = service.NewScheduler()
	service.GlobalScheduler.StartAll()

	r := gin.Default()
	r.Use(CORSMiddleware())

	api := r.Group("/api")
	{
		api.GET("/regions", handler.GetRegions)

		api.POST("/test", handler.RunTest)
		api.GET("/test/history", handler.GetTestHistory)
		api.GET("/test/:id", handler.GetTestByID)
		api.DELETE("/test/:id", handler.DeleteTest)

		api.GET("/monitor", handler.GetMonitorTasks)
		api.POST("/monitor", handler.CreateMonitorTask)
		api.PUT("/monitor/:id", handler.UpdateMonitorTask)
		api.DELETE("/monitor/:id", handler.DeleteMonitorTask)
		api.GET("/monitor/:id/results", handler.GetMonitorResults)
	}

	go func() {
		port := os.Getenv("PORT")
		if port == "" {
			port = "8080"
		}
		log.Printf("Server starting on port %s", port)
		if err := r.Run(":" + port); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down scheduler...")
	if service.GlobalScheduler != nil {
		service.GlobalScheduler.StopAll()
	}
	log.Println("Server stopped")
}
