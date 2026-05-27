package routes

import (
	"github.com/gin-gonic/gin"
	"portfolio/controllers"
	"portfolio/middleware"
)

func Setup(r *gin.Engine) {
	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", controllers.Login)
		}

		public := api.Group("")
		{
			public.GET("/projects", controllers.GetProjects)
			public.GET("/projects/:slug", controllers.GetProject)
			public.GET("/categories", controllers.GetCategories)
			public.GET("/skills", controllers.GetSkills)
			public.GET("/about", controllers.GetAbout)
			public.POST("/contact", controllers.CreateContact)
		}

		admin := api.Group("")
		admin.Use(middleware.AuthMiddleware())
		{
			admin.GET("/projects/all", controllers.GetAllProjects)
			admin.POST("/projects", middleware.AdminOnly(), controllers.CreateProject)
			admin.PUT("/projects/:id", middleware.AdminOnly(), controllers.UpdateProject)
			admin.DELETE("/projects/:id", middleware.AdminOnly(), controllers.DeleteProject)

			admin.POST("/categories", middleware.AdminOnly(), controllers.CreateCategory)
			admin.PUT("/categories/:id", middleware.AdminOnly(), controllers.UpdateCategory)
			admin.DELETE("/categories/:id", middleware.AdminOnly(), controllers.DeleteCategory)

			admin.POST("/skills", middleware.AdminOnly(), controllers.CreateSkill)
			admin.PUT("/skills/:id", middleware.AdminOnly(), controllers.UpdateSkill)
			admin.DELETE("/skills/:id", middleware.AdminOnly(), controllers.DeleteSkill)

			admin.PUT("/about", middleware.AdminOnly(), controllers.UpdateAbout)

			admin.GET("/contacts", middleware.AdminOnly(), controllers.GetContacts)
			admin.PUT("/contacts/:id/read", middleware.AdminOnly(), controllers.MarkContactRead)
			admin.DELETE("/contacts/:id", middleware.AdminOnly(), controllers.DeleteContact)

			admin.POST("/upload", middleware.AdminOnly(), controllers.UploadImage)
		}
	}
}
