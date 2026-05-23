package main

import (
	"log"
	"server-monitoring-dashboard/db"
	"server-monitoring-dashboard/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	db.Init("./data")

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.POST("/agent/report", handlers.AgentReportHandler)

		api.GET("/nodes", handlers.GetNodes)
		api.GET("/nodes/:id", handlers.GetNode)
		api.POST("/nodes", handlers.CreateNode)
		api.PUT("/nodes/:id", handlers.UpdateNode)
		api.DELETE("/nodes/:id", handlers.DeleteNode)
		api.POST("/nodes/:id/regenerate-token", handlers.RegenerateToken)

		api.GET("/metrics/latest", handlers.GetLatestMetrics)
		api.GET("/nodes/:id/metrics", handlers.GetNodeMetrics)
		api.GET("/nodes/:id/metrics/latest", handlers.GetLatestNodeMetric)

		api.GET("/alert-rules", handlers.GetAlertRules)
		api.POST("/alert-rules", handlers.CreateAlertRule)
		api.POST("/alert-rules/:id/toggle", handlers.ToggleAlertRule)
		api.DELETE("/alert-rules/:id", handlers.DeleteAlertRule)

		api.GET("/alert-records", handlers.GetAlertRecords)
		api.DELETE("/alert-records", handlers.ClearAlertRecords)
	}

	r.Static("/static", "./web/dist")
	r.NoRoute(func(c *gin.Context) {
		c.File("./web/dist/index.html")
	})

	log.Println("Server starting on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
