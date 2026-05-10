package routers

import (
	"urbanrail/controllers"
	"urbanrail/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORSMiddleware())

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/user/register", controllers.UserRegister)
			auth.POST("/user/login", controllers.UserLogin)
			auth.POST("/admin/login", controllers.AdminLogin)
			auth.POST("/logout", controllers.UserLogout)
		}

		home := api.Group("/home")
		{
			home.GET("/banners", controllers.GetHomeBanners)
			home.GET("/announcements", controllers.GetHomeAnnouncements)
			home.GET("/recommended-tasks", controllers.GetRecommendedTasks)
			home.GET("/task-types", controllers.GetAllTaskTypes)
		}

		userAuth := api.Group("")
		userAuth.Use(middleware.AuthMiddleware(), middleware.UserMiddleware())
		{
			userAuth.GET("/user/me", controllers.GetCurrentUser)

			userAuth.GET("/tasks", controllers.GetTasksForUser)
			userAuth.GET("/tasks/:id", controllers.GetTaskDetail)
			userAuth.POST("/tasks/:id/accept", controllers.AcceptTask)
			userAuth.POST("/tasks/:id/favorite", controllers.ToggleFavorite)
			userAuth.POST("/tasks/:id/comment", controllers.AddComment)
			userAuth.GET("/tasks/:id/comments", controllers.GetTaskCommentsForUser)

			userAuth.GET("/my/assignments", controllers.GetMyTaskAssignments)
			userAuth.GET("/my/results", controllers.GetMyTaskResults)
			userAuth.POST("/my/assignments/:id/submit", controllers.SubmitTaskResult)

			userAuth.GET("/my/favorites", controllers.GetMyFavorites)
		}

		adminAuth := api.Group("/admin")
		adminAuth.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			adminAuth.GET("/me", controllers.GetCurrentAdmin)
			adminAuth.PUT("/profile", controllers.UpdateAdminProfile)
			adminAuth.PUT("/password", controllers.ChangeAdminPassword)

			users := adminAuth.Group("/users")
			{
				users.GET("", controllers.GetUserList)
				users.GET("/:id", controllers.GetUserDetail)
				users.POST("", controllers.CreateUser)
				users.PUT("/:id", controllers.UpdateUser)
				users.DELETE("/:id", controllers.DeleteUser)
			}

			publishers := adminAuth.Group("/publishers")
			{
				publishers.GET("", controllers.GetPublisherList)
				publishers.GET("/all", controllers.GetAllPublishers)
				publishers.GET("/:id", controllers.GetPublisherDetail)
				publishers.POST("", controllers.CreatePublisher)
				publishers.PUT("/:id", controllers.UpdatePublisher)
				publishers.DELETE("/:id", controllers.DeletePublisher)
			}

			taskTypes := adminAuth.Group("/task-types")
			{
				taskTypes.GET("", controllers.GetTaskTypeList)
				taskTypes.GET("/all", controllers.GetAllTaskTypes)
				taskTypes.GET("/:id", controllers.GetTaskTypeDetail)
				taskTypes.POST("", controllers.CreateTaskType)
				taskTypes.PUT("/:id", controllers.UpdateTaskType)
				taskTypes.DELETE("/:id", controllers.DeleteTaskType)
			}

			tasks := adminAuth.Group("/tasks")
			{
				tasks.GET("", controllers.GetTaskList)
				tasks.GET("/:id", controllers.GetTaskDetail)
				tasks.POST("", controllers.CreateTask)
				tasks.PUT("/:id", controllers.UpdateTask)
				tasks.DELETE("/:id", controllers.DeleteTask)
				tasks.PUT("/:id/audit", controllers.AuditTask)
				tasks.GET("/:id/comments", controllers.GetTaskComments)
				tasks.DELETE("/comments/:id", controllers.DeleteComment)
			}

			results := adminAuth.Group("/results")
			{
				results.GET("", controllers.GetTaskResultList)
				results.GET("/:id", controllers.GetTaskResultDetail)
				results.DELETE("/:id", controllers.DeleteTaskResult)
				results.PUT("/:id/audit", controllers.AuditTaskResult)
			}

			banners := adminAuth.Group("/banners")
			{
				banners.GET("", controllers.GetBannerList)
				banners.GET("/:id", controllers.GetBannerDetail)
				banners.POST("", controllers.CreateBanner)
				banners.PUT("/:id", controllers.UpdateBanner)
				banners.DELETE("/:id", controllers.DeleteBanner)
			}

			announcements := adminAuth.Group("/announcements")
			{
				announcements.GET("", controllers.GetAnnouncementList)
				announcements.GET("/:id", controllers.GetAnnouncementDetail)
				announcements.POST("", controllers.CreateAnnouncement)
				announcements.PUT("/:id", controllers.UpdateAnnouncement)
				announcements.DELETE("/:id", controllers.DeleteAnnouncement)
			}
		}
	}

	return r
}
