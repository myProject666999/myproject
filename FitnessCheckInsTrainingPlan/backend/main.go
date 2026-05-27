package main

import (
	"fitness-tracker/database"
	"fitness-tracker/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.Init()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.GET("/exercises", handlers.GetExercises)
		api.POST("/exercises", handlers.CreateExercise)

		api.GET("/plans", handlers.GetTrainingPlans)
		api.POST("/plans", handlers.CreateTrainingPlan)
		api.PUT("/plans/:id", handlers.UpdateTrainingPlan)
		api.DELETE("/plans/:id", handlers.DeleteTrainingPlan)

		api.GET("/checkins", handlers.GetCheckIns)
		api.GET("/checkins/today", handlers.GetTodayCheckIn)
		api.POST("/checkins", handlers.CreateCheckIn)

		api.GET("/body-records", handlers.GetBodyRecords)
		api.POST("/body-records", handlers.CreateBodyRecord)

		api.GET("/achievements", handlers.GetAchievements)

		api.GET("/stats", handlers.GetStats)
	}

	r.Run(":8081")
}
