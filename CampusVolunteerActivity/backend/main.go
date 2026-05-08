package main

import (
	"log"
	"os"

	"campus-volunteer-system/config"
	"campus-volunteer-system/handlers"
	"campus-volunteer-system/middleware"
	"campus-volunteer-system/utils"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	utils.JWTSecret = cfg.JWTSecret

	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := config.AutoMigrate(db); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	if err := config.SeedAdminUser(db); err != nil {
		log.Printf("Failed to seed admin user: %v", err)
	}

	if err := os.MkdirAll(cfg.UploadDir, 0755); err != nil {
		log.Printf("Failed to create upload directory: %v", err)
	}

	r := gin.Default()

	r.Use(middleware.CorsMiddleware())

	r.Static("/uploads", cfg.UploadDir)

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", handlers.Login)
			auth.POST("/register", handlers.Register)
		}

		api.GET("/activities", handlers.GetActivities)
		api.GET("/activities/:id", handlers.GetActivityDetail)
		api.GET("/activities/:id/comments", handlers.GetComments)
		api.GET("/carousels", handlers.GetCarousels)
		api.GET("/volunteers/excellent", handlers.GetExcellentVolunteers)

		authGroup := api.Group("")
		authGroup.Use(middleware.AuthMiddleware())
		{
			authGroup.GET("/user/me", handlers.GetCurrentUser)
			authGroup.PUT("/user/profile", handlers.UpdateProfile)
			authGroup.PUT("/user/password", handlers.ChangePassword)
			authGroup.GET("/user/points", handlers.GetMyPoints)
			
			authGroup.GET("/my-activities", handlers.GetMyActivities)
			authGroup.POST("/activities/:id/register", handlers.RegisterActivity)
			authGroup.POST("/activities/:id/cancel", handlers.CancelRegistration)
			authGroup.POST("/activities/:id/comments", handlers.CreateComment)

			authGroup.POST("/upload", handlers.UploadImage)

			adminGroup := authGroup.Group("")
			adminGroup.Use(middleware.AdminMiddleware())
			{
				adminGroup.POST("/activities", handlers.CreateActivity)
				adminGroup.PUT("/activities/:id", handlers.UpdateActivity)
				adminGroup.DELETE("/activities/:id", handlers.DeleteActivity)

				adminGroup.GET("/stats", handlers.GetStats)
				adminGroup.GET("/stats/trend", handlers.GetMonthlyActivityTrend)

				adminGroup.GET("/volunteers", handlers.GetVolunteers)
				adminGroup.GET("/volunteers/:id", handlers.GetVolunteerDetail)
				adminGroup.PUT("/volunteers/:id/excellent", handlers.ToggleExcellentVolunteer)
				adminGroup.DELETE("/volunteers/:id", handlers.DeleteVolunteer)
				adminGroup.GET("/colleges", handlers.GetCollegeList)

				adminGroup.GET("/carousels/all", handlers.GetAllCarousels)
				adminGroup.POST("/carousels", handlers.CreateCarousel)
				adminGroup.PUT("/carousels/:id", handlers.UpdateCarousel)
				adminGroup.DELETE("/carousels/:id", handlers.DeleteCarousel)
				adminGroup.PUT("/carousels/:id/status", handlers.ToggleCarouselStatus)
			}
		}
	}

	log.Printf("Server starting on port %s...", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
