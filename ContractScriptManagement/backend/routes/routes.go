package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"script-management/controllers"
	"script-management/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
			auth.GET("/me", middleware.AuthMiddleware(), controllers.GetCurrentUser)
			auth.PUT("/profile", middleware.AuthMiddleware(), controllers.UpdateProfile)
		}

		api.GET("/carousels", controllers.GetCarousels)
		api.GET("/scripts/types", controllers.GetScriptTypes)
		api.GET("/scripts", controllers.GetScripts)
		api.GET("/scripts/hot", controllers.GetHotScripts)
		api.GET("/scripts/:id", controllers.GetScript)
		api.GET("/rooms", controllers.GetRooms)
		api.GET("/news", controllers.GetNews)
		api.GET("/news/:id", controllers.GetNewsDetail)
		api.GET("/discussions", controllers.GetDiscussions)
		api.GET("/discussions/:id", controllers.GetDiscussion)

		api.GET("/admin/carousels", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetAllCarousels)
		api.POST("/admin/carousels", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.CreateCarousel)
		api.GET("/admin/carousels/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetCarousel)
		api.PUT("/admin/carousels/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.UpdateCarousel)
		api.DELETE("/admin/carousels/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.DeleteCarousel)

		api.GET("/admin/users", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetUsers)
		api.POST("/admin/users", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.CreateUser)
		api.GET("/admin/users/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetUser)
		api.PUT("/admin/users/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.UpdateUser)
		api.DELETE("/admin/users/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.DeleteUser)

		api.GET("/admin/types", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetScriptTypesPaginated)
		api.POST("/admin/types", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.CreateScriptType)
		api.GET("/admin/types/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetScriptType)
		api.PUT("/admin/types/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.UpdateScriptType)
		api.DELETE("/admin/types/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.DeleteScriptType)

		api.GET("/admin/scripts", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetAllScripts)
		api.POST("/admin/scripts", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.CreateScript)
		api.GET("/admin/scripts/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetScript)
		api.PUT("/admin/scripts/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.UpdateScript)
		api.DELETE("/admin/scripts/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.DeleteScript)

		api.GET("/admin/rooms", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetAllRooms)
		api.POST("/admin/rooms", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.CreateRoom)
		api.GET("/admin/rooms/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetRoom)
		api.PUT("/admin/rooms/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.UpdateRoom)
		api.DELETE("/admin/rooms/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.DeleteRoom)

		api.GET("/admin/orders", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetAllOrders)
		api.GET("/admin/orders/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetOrder)
		api.PUT("/admin/orders/:id/status", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.UpdateOrderStatus)
		api.DELETE("/admin/orders/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.DeleteOrder)

		api.GET("/admin/discussions", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetDiscussions)
		api.GET("/admin/discussions/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetDiscussion)
		api.PUT("/admin/discussions/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.UpdateDiscussion)
		api.DELETE("/admin/discussions/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.DeleteDiscussion)

		api.GET("/admin/news", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetAllNews)
		api.POST("/admin/news", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.CreateNews)
		api.GET("/admin/news/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.GetNewsDetail)
		api.PUT("/admin/news/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.UpdateNews)
		api.DELETE("/admin/news/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.DeleteNews)

		api.GET("/orders", middleware.AuthMiddleware(), controllers.GetOrders)
		api.POST("/orders", middleware.AuthMiddleware(), controllers.CreateOrder)
		api.GET("/orders/:id", middleware.AuthMiddleware(), controllers.GetOrder)

		api.GET("/my/discussions", middleware.AuthMiddleware(), controllers.GetMyDiscussions)
		api.POST("/discussions", middleware.AuthMiddleware(), controllers.CreateDiscussion)
	}

	return r
}
