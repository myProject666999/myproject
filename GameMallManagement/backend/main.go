package main

import (
	"gamemall/database"
	"gamemall/handlers"
	"gamemall/middleware"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.Init()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")
	{
		api.POST("/register", handlers.Register)
		api.POST("/login", handlers.Login)

		api.GET("/games", handlers.GetGames)
		api.GET("/games/:id", handlers.GetGame)

		api.GET("/categories", handlers.GetCategories)

		api.GET("/news", handlers.GetNews)
		api.GET("/news/:id", handlers.GetNewsDetail)

		auth := api.Group("")
		auth.Use(middleware.AuthMiddleware())
		{
			auth.GET("/user", handlers.GetCurrentUser)

			auth.GET("/cart", handlers.GetCart)
			auth.POST("/cart", handlers.AddToCart)
			auth.PUT("/cart/:id", handlers.UpdateCartItem)
			auth.DELETE("/cart/:id", handlers.RemoveFromCart)

			auth.POST("/checkout", handlers.Checkout)

			auth.GET("/orders", handlers.GetOrders)
			auth.GET("/orders/:id", handlers.GetOrder)
			auth.DELETE("/orders/:id", handlers.DeleteOrder)

			admin := auth.Group("")
			admin.Use(middleware.AdminMiddleware())
			{
				admin.POST("/games", handlers.CreateGame)
				admin.PUT("/games/:id", handlers.UpdateGame)
				admin.DELETE("/games/:id", handlers.DeleteGame)

				admin.POST("/categories", handlers.CreateCategory)
				admin.PUT("/categories/:id", handlers.UpdateCategory)
				admin.DELETE("/categories/:id", handlers.DeleteCategory)

				admin.GET("/users", handlers.GetUsers)
				admin.DELETE("/users/:id", handlers.DeleteUser)

				admin.PUT("/orders/:id/status", handlers.UpdateOrderStatus)

				admin.POST("/news", handlers.CreateNews)
				admin.PUT("/news/:id", handlers.UpdateNews)
				admin.DELETE("/news/:id", handlers.DeleteNews)
			}
		}
	}

	r.Run(":8080")
}
