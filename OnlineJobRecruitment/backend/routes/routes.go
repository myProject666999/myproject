package routes

import (
	"online-job-recruitment/controllers"
	"online-job-recruitment/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	api := r.Group("/api")
	{
		auth := api.Group("")
		{
			auth.POST("/login", controllers.Login)
			auth.POST("/register", controllers.Register)
		}

		api.GET("/job-types", controllers.GetJobTypes)
		api.GET("/jobs", controllers.GetJobs)
		api.GET("/jobs/:id", controllers.GetJob)
		api.GET("/news", controllers.GetNews)
		api.GET("/news/:id", controllers.GetNewsDetail)
		api.GET("/exercises", controllers.GetExercises)
		api.GET("/reviews", controllers.GetReviews)

		protected := api.Group("")
		protected.Use(middleware.Auth())
		{
			protected.GET("/user", controllers.GetCurrentUser)
			protected.PUT("/user/profile", controllers.UpdateProfile)
			protected.PUT("/user/password", controllers.ChangePassword)

			protected.GET("/resume/my", controllers.GetMyResume)
			protected.POST("/resume", controllers.SaveResume)
			protected.PUT("/resume", controllers.SaveResume)

			protected.POST("/applications", controllers.ApplyJob)
			protected.GET("/applications/my", controllers.GetMyApplications)

			protected.GET("/exercises/:id", controllers.GetExercise)
			protected.POST("/exercises/submit", controllers.SubmitExercise)

			protected.GET("/reviews/my", controllers.GetMyReviews)
			protected.POST("/reviews", controllers.CreateReview)
		}

		admin := api.Group("/admin")
		admin.Use(middleware.Auth(), middleware.AdminAuth())
		{
			admin.GET("/stats", controllers.GetDashboardStats)

			admin.GET("/admins", controllers.GetAdmins)
			admin.POST("/admins", controllers.CreateAdmin)
			admin.PUT("/admins/:id", controllers.UpdateAdmin)
			admin.DELETE("/admins/:id", controllers.DeleteAdmin)
			admin.POST("/admins/:id/reset-password", controllers.ResetPassword)

			admin.GET("/recruiters", controllers.GetRecruiters)
			admin.POST("/recruiters", controllers.CreateRecruiter)
			admin.PUT("/recruiters/:id", controllers.UpdateRecruiter)
			admin.DELETE("/recruiters/:id", controllers.DeleteRecruiter)
			admin.POST("/recruiters/:id/reset-password", controllers.ResetPassword)

			admin.GET("/users", controllers.GetUsers)
			admin.DELETE("/users/:id", controllers.DeleteUser)

			admin.GET("/job-types", controllers.GetAllJobTypes)
			admin.POST("/job-types", controllers.CreateJobType)
			admin.PUT("/job-types/:id", controllers.UpdateJobType)
			admin.DELETE("/job-types/:id", controllers.DeleteJobType)

			admin.GET("/jobs", controllers.GetAllJobs)
			admin.DELETE("/jobs/:id", controllers.DeleteJob)

			admin.GET("/exercises", controllers.GetAllExercises)
			admin.POST("/exercises", controllers.CreateExercise)
			admin.GET("/exercises/:id", controllers.GetExercise)
			admin.PUT("/exercises/:id", controllers.UpdateExercise)
			admin.DELETE("/exercises/:id", controllers.DeleteExercise)

			admin.GET("/news", controllers.GetAllNews)
			admin.POST("/news", controllers.CreateNews)
			admin.GET("/news/:id", controllers.GetNewsDetail)
			admin.PUT("/news/:id", controllers.UpdateNews)
			admin.DELETE("/news/:id", controllers.DeleteNews)

			admin.DELETE("/reviews/:id", controllers.DeleteReview)
		}

		recruiter := api.Group("/recruiter")
		recruiter.Use(middleware.Auth(), middleware.RecruiterAuth())
		{
			recruiter.GET("/job-types", controllers.GetAllJobTypes)
			recruiter.POST("/job-types", controllers.CreateJobType)
			recruiter.PUT("/job-types/:id", controllers.UpdateJobType)
			recruiter.DELETE("/job-types/:id", controllers.DeleteJobType)

			recruiter.GET("/jobs", controllers.GetRecruiterJobs)
			recruiter.POST("/jobs", controllers.CreateJob)
			recruiter.GET("/jobs/:id", controllers.GetJob)
			recruiter.PUT("/jobs/:id", controllers.UpdateJob)
			recruiter.DELETE("/jobs/:id", controllers.DeleteJob)

			recruiter.GET("/applications", controllers.GetApplications)
			recruiter.GET("/resumes/:id", controllers.GetResume)
			recruiter.PUT("/applications/:id/status", controllers.UpdateApplicationStatus)

			recruiter.POST("/favorites", controllers.AddFavorite)
			recruiter.GET("/favorites", controllers.GetFavorites)
			recruiter.DELETE("/favorites/:id", controllers.RemoveFavorite)
		}
	}

	return r
}
