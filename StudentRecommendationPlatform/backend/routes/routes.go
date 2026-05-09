package routes

import (
	"student-recommendation-platform/controllers"
	"student-recommendation-platform/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.POST("/admin/login", controllers.AdminLogin)
		api.POST("/user/register", controllers.UserRegister)
		api.POST("/user/login", controllers.UserLogin)

		api.GET("/carousels", controllers.ListCarousels)
		api.GET("/news", controllers.ListNews)
		api.GET("/notices", controllers.ListNotices)
		api.GET("/news/:id", controllers.GetNews)
		api.GET("/notices/:id", controllers.GetNotice)
		api.GET("/campus-stories", controllers.ListCampusStories)

		api.GET("/books", controllers.ListBooks)
		api.GET("/books/:id", controllers.GetBook)
		api.GET("/knowledge-points", controllers.ListKnowledgePoints)
		api.GET("/knowledge-points/:id", controllers.GetKnowledgePoint)
		api.GET("/courses", controllers.ListCourses)
		api.GET("/courses/:id", controllers.GetCourse)
		api.GET("/categories", controllers.ListCategories)

		api.GET("/system-settings/:key", controllers.GetSystemSetting)

		api.GET("/comments", controllers.ListComments)

		authUser := api.Group("/user")
		authUser.Use(middleware.UserAuthMiddleware())
		{
			authUser.POST("/logout", controllers.UserLogout)
			authUser.GET("/profile", controllers.GetUserProfile)
			authUser.PUT("/profile", controllers.UpdateUserProfile)

			authUser.POST("/favorites", controllers.AddFavorite)
			authUser.DELETE("/favorites/:id", controllers.RemoveFavorite)
			authUser.GET("/favorites", controllers.ListFavorites)

			authUser.POST("/comments", controllers.AddComment)

			authUser.POST("/messages", controllers.AddMessage)
			authUser.GET("/messages", controllers.ListUserMessages)

			authUser.POST("/demands", controllers.AddDemand)
			authUser.GET("/demands", controllers.ListUserDemands)
		}

		authAdmin := api.Group("/admin")
		authAdmin.Use(middleware.AdminAuthMiddleware())
		{
			authAdmin.POST("/logout", controllers.AdminLogout)
			authAdmin.GET("/profile", controllers.GetAdminProfile)
			authAdmin.PUT("/password", controllers.ChangeAdminPassword)

			authAdmin.GET("/users", controllers.ListAdminUsers)
			authAdmin.POST("/users", controllers.CreateAdminUser)
			authAdmin.PUT("/users/:id", controllers.UpdateAdminUser)
			authAdmin.DELETE("/users/:id", controllers.DeleteAdminUser)

			authAdmin.GET("/front-users", controllers.ListFrontUsers)
			authAdmin.PUT("/front-users/:id", controllers.UpdateFrontUser)
			authAdmin.DELETE("/front-users/:id", controllers.DeleteFrontUser)
			authAdmin.PUT("/front-users/:id/approve", controllers.ApproveFrontUser)

			authAdmin.GET("/news", controllers.ListAdminNews)
			authAdmin.POST("/news", controllers.CreateNews)
			authAdmin.PUT("/news/:id", controllers.UpdateNews)
			authAdmin.DELETE("/news/:id", controllers.DeleteNews)

			authAdmin.GET("/campus-stories", controllers.ListAdminCampusStories)
			authAdmin.POST("/campus-stories", controllers.CreateCampusStory)
			authAdmin.PUT("/campus-stories/:id", controllers.UpdateCampusStory)
			authAdmin.DELETE("/campus-stories/:id", controllers.DeleteCampusStory)

			authAdmin.GET("/notices", controllers.ListAdminNotices)
			authAdmin.POST("/notices", controllers.CreateNotice)
			authAdmin.PUT("/notices/:id", controllers.UpdateNotice)
			authAdmin.DELETE("/notices/:id", controllers.DeleteNotice)

			authAdmin.GET("/system-settings", controllers.ListSystemSettings)
			authAdmin.PUT("/system-settings", controllers.UpdateSystemSettings)

			authAdmin.GET("/messages", controllers.ListAdminMessages)
			authAdmin.PUT("/messages/:id/reply", controllers.ReplyMessage)
			authAdmin.DELETE("/messages/:id", controllers.DeleteMessage)

			authAdmin.GET("/carousels", controllers.ListAdminCarousels)
			authAdmin.POST("/carousels", controllers.CreateCarousel)
			authAdmin.PUT("/carousels/:id", controllers.UpdateCarousel)
			authAdmin.DELETE("/carousels/:id", controllers.DeleteCarousel)

			authAdmin.GET("/books", controllers.ListAdminBooks)
			authAdmin.POST("/books", controllers.CreateBook)
			authAdmin.PUT("/books/:id", controllers.UpdateBook)
			authAdmin.DELETE("/books/:id", controllers.DeleteBook)

			authAdmin.GET("/knowledge-points", controllers.ListAdminKnowledgePoints)
			authAdmin.POST("/knowledge-points", controllers.CreateKnowledgePoint)
			authAdmin.PUT("/knowledge-points/:id", controllers.UpdateKnowledgePoint)
			authAdmin.DELETE("/knowledge-points/:id", controllers.DeleteKnowledgePoint)
			authAdmin.GET("/knowledge-points/export", controllers.ExportKnowledgePoints)

			authAdmin.GET("/courses", controllers.ListAdminCourses)
			authAdmin.POST("/courses", controllers.CreateCourse)
			authAdmin.PUT("/courses/:id", controllers.UpdateCourse)
			authAdmin.DELETE("/courses/:id", controllers.DeleteCourse)
			authAdmin.GET("/courses/export", controllers.ExportCourses)
			authAdmin.GET("/courses/:id/comments", controllers.ListCourseComments)
			authAdmin.DELETE("/comments/:id", controllers.DeleteComment)

			authAdmin.GET("/categories", controllers.ListAdminCategories)
			authAdmin.POST("/categories", controllers.CreateCategory)
			authAdmin.PUT("/categories/:id", controllers.UpdateCategory)
			authAdmin.DELETE("/categories/:id", controllers.DeleteCategory)

			authAdmin.GET("/demands", controllers.ListAdminDemands)
			authAdmin.PUT("/demands/:id/approve", controllers.ApproveDemand)
			authAdmin.DELETE("/demands/:id", controllers.DeleteDemand)

			authAdmin.POST("/backup", controllers.BackupDatabase)
		}
	}
}
