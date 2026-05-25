package main

import (
	"log"
	"online-quiz-game/config"
	"online-quiz-game/database"
	"online-quiz-game/handlers"
	"online-quiz-game/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	if err := database.InitMySQL(cfg); err != nil {
		log.Fatalf("Failed to connect to MySQL: %v", err)
	}
	defer database.CloseMySQL()

	if err := database.InitRedis(cfg); err != nil {
		log.Printf("Warning: Failed to connect to Redis: %v", err)
		log.Println("Continuing without Redis leaderboard...")
	}
	defer database.CloseRedis()

	h := handlers.NewHandler(cfg)

	r := gin.Default()

	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	r.GET("/health", h.HealthCheck)

	api := r.Group("/api")
	{
		api.POST("/login", h.Login)

		api.GET("/categories", h.GetCategories)

		api.POST("/quiz/start", h.StartQuiz)
		api.POST("/quiz/submit", h.SubmitAnswer)
		api.POST("/quiz/finish", h.FinishQuiz)

		api.GET("/leaderboard", h.GetLeaderboard)
		api.GET("/user/rank", h.GetUserRank)

		api.GET("/history", h.GetHistory)
		api.GET("/game/detail", h.GetGameDetail)

		api.GET("/questions", h.GetAllQuestions)
		api.POST("/questions", h.AddQuestion)
		api.PUT("/questions/:id", h.UpdateQuestion)
		api.DELETE("/questions/:id", h.DeleteQuestion)
	}

	log.Printf("Server starting on port %s", cfg.ServerPort)
	if err := r.Run(cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
