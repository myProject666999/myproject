package routes

import (
	"english-learning/controllers"
	"english-learning/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.Use(middleware.CORSMiddleware())

	api := router.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
			auth.GET("/activate", controllers.Activate)
		}

		api.GET("/announcements", controllers.GetAnnouncements)
		api.GET("/announcements/latest", controllers.GetLatestAnnouncements)
		api.GET("/announcements/:id", controllers.GetAnnouncement)

		api.GET("/daily-sentence", controllers.GetRandomDailySentence)
		api.GET("/daily-sentences", controllers.GetDailySentences)

		api.GET("/listening", controllers.GetListeningMaterials)
		api.GET("/listening/years", controllers.GetAvailableYears)
		api.GET("/listening/:id", controllers.GetListeningMaterial)

		api.GET("/books", controllers.GetBooks)

		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/user/me", controllers.GetCurrentUser)
			protected.PUT("/user/profile", controllers.UpdateProfile)
			protected.PUT("/user/password", controllers.UpdatePassword)

			protected.GET("/words/:level", controllers.GetWordsByLevel)
			protected.GET("/words/random/:level", controllers.GetRandomWord)
			protected.POST("/words/:id/status", controllers.UpdateWordStatus)
			protected.GET("/favorites/words", controllers.GetFavoriteWords)
			protected.GET("/progress/learning", controllers.GetLearningProgress)

			protected.GET("/books/:id", controllers.GetBook)
			protected.POST("/books/:id/progress", controllers.UpdateBookProgress)
			protected.GET("/progress/reading", controllers.GetReadingProgress)

			admin := protected.Group("/admin")
			admin.Use(middleware.AdminMiddleware())
			{
				admin.GET("/stats", controllers.GetStats)

				admin.GET("/users", controllers.GetUsers)
				admin.PUT("/users/:id", controllers.UpdateUser)
				admin.DELETE("/users/:id", controllers.DeleteUser)
				admin.POST("/users/:id/reset-password", controllers.AdminResetUserPassword)

				admin.POST("/words", controllers.CreateWord)
				admin.PUT("/words/:id", controllers.UpdateWord)
				admin.DELETE("/words/:id", controllers.DeleteWord)

				admin.POST("/announcements", controllers.CreateAnnouncement)
				admin.PUT("/announcements/:id", controllers.UpdateAnnouncement)
				admin.DELETE("/announcements/:id", controllers.DeleteAnnouncement)

				admin.POST("/books", controllers.CreateBook)
				admin.PUT("/books/:id", controllers.UpdateBook)
				admin.DELETE("/books/:id", controllers.DeleteBook)
			}
		}
	}
}
