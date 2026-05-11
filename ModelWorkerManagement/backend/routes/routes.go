package routes

import (
	"model-worker-management/controllers"
	"model-worker-management/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	public := r.Group("/api")
	{
		public.POST("/auth/register", controllers.Register)
		public.POST("/auth/login", controllers.Login)
		public.GET("/banners", controllers.GetBanners)
		public.GET("/announcements", controllers.GetAnnouncements)
		public.GET("/announcements/:id", controllers.GetAnnouncementByID)
		public.GET("/trainings", controllers.GetTrainings)
		public.GET("/trainings/:id", controllers.GetTrainingByID)
		public.GET("/forum", controllers.GetForumPosts)
		public.GET("/forum/:id", controllers.GetForumPostByID)
		public.GET("/search", controllers.Search)
	}

	worker := r.Group("/api")
	worker.Use(middleware.AuthMiddleware())
	{
		worker.GET("/user/profile", controllers.GetProfile)
		worker.PUT("/user/profile", controllers.UpdateProfile)
		worker.PUT("/user/password", controllers.ChangePassword)

		worker.POST("/forum", controllers.CreateForumPost)
		worker.DELETE("/forum/:id", controllers.DeleteForumPost)

		worker.POST("/trainings/:id/enroll", controllers.EnrollTraining)

		worker.GET("/favorites", controllers.GetFavorites)
		worker.POST("/favorites", controllers.AddFavorite)
		worker.POST("/favorites/toggle", controllers.ToggleFavorite)
		worker.DELETE("/favorites/:id", controllers.RemoveFavorite)

		worker.GET("/comments", controllers.GetComments)
		worker.POST("/comments", controllers.AddComment)
		worker.DELETE("/comments/:id", controllers.DeleteComment)

		worker.GET("/user/my-posts", controllers.GetMyPosts)
		worker.GET("/user/my-favorites", controllers.GetMyFavorites)
		worker.GET("/user/my-enrollments", controllers.GetMyEnrollments)
	}

	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		admin.GET("/stats", controllers.GetDashboardStats)
		admin.GET("/users", controllers.GetAllUsers)
		admin.GET("/users/:id", controllers.GetUserByID)
		admin.PUT("/users/:id", controllers.UpdateUserStatus)

		admin.GET("/archives", controllers.GetArchives)
		admin.GET("/archives/:id", controllers.GetArchiveByID)
		admin.POST("/archives", controllers.CreateArchive)
		admin.PUT("/archives/:id", controllers.UpdateArchive)
		admin.DELETE("/archives/:id", controllers.DeleteArchive)

		admin.GET("/archive-changes", controllers.GetArchiveChanges)
		admin.GET("/archive-changes/:id", controllers.GetArchiveChangeByID)
		admin.POST("/archive-changes", controllers.CreateArchiveChange)
		admin.PUT("/archive-changes/:id/review", controllers.ReviewArchiveChange)
		admin.DELETE("/archive-changes/:id", controllers.DeleteArchiveChange)

		admin.GET("/rewards-punishments", controllers.GetRewardPunishments)
		admin.GET("/rewards-punishments/:id", controllers.GetRewardPunishmentByID)
		admin.POST("/rewards-punishments", controllers.CreateRewardPunishment)
		admin.PUT("/rewards-punishments/:id", controllers.UpdateRewardPunishment)
		admin.DELETE("/rewards-punishments/:id", controllers.DeleteRewardPunishment)

		admin.GET("/training-enrollments", controllers.GetTrainingEnrollments)
		admin.PUT("/training-enrollments/:id/review", controllers.ReviewTrainingEnrollment)

		admin.GET("/courses", controllers.GetCourses)
		admin.GET("/courses/:id", controllers.GetCourseByID)
		admin.POST("/courses", controllers.CreateCourse)
		admin.PUT("/courses/:id", controllers.UpdateCourse)
		admin.DELETE("/courses/:id", controllers.DeleteCourse)

		admin.POST("/trainings", controllers.CreateTraining)
		admin.PUT("/trainings/:id", controllers.UpdateTraining)
		admin.DELETE("/trainings/:id", controllers.DeleteTraining)

		admin.POST("/announcements", controllers.CreateAnnouncement)
		admin.PUT("/announcements/:id", controllers.UpdateAnnouncement)
		admin.DELETE("/announcements/:id", controllers.DeleteAnnouncement)
	}
}
