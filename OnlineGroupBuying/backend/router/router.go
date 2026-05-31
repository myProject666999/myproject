package router

import (
	"group-buying/handlers"
	"group-buying/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.GET("/api/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"code": 0, "message": "pong"})
	})

	api := r.Group("/api")
	{
		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/login", handlers.Login)

		api.GET("/products", handlers.GetProductsByPage)
		api.GET("/products/all", handlers.GetProducts)
		api.GET("/products/:id", handlers.GetProduct)

		api.GET("/groups", handlers.GetGroupList)
		api.GET("/groups/:id", handlers.GetGroupDetail)

		auth := api.Group("")
		auth.Use(middleware.Auth())
		{
			auth.GET("/user/info", handlers.GetUserInfo)
			auth.PUT("/user/info", handlers.UpdateUserInfo)
			auth.GET("/user/balance", handlers.GetUserBalance)

			auth.POST("/groups", handlers.CreateGroup)
			auth.POST("/groups/:id/join", handlers.JoinGroup)
			auth.POST("/groups/:id/cancel", handlers.CancelGroup)
			auth.GET("/my/groups", handlers.GetMyGroups)

			auth.GET("/orders", handlers.GetMyOrders)
			auth.GET("/orders/:id", handlers.GetOrderDetail)
			auth.POST("/orders/:id/refund", handlers.RefundOrder)

			auth.GET("/refunds", handlers.GetMyRefunds)
		}

		admin := api.Group("/admin")
		admin.Use(middleware.Auth(), middleware.AdminAuth())
		{
			admin.GET("/users", handlers.AdminGetUsers)
			admin.PUT("/users/:id/status", handlers.AdminUpdateUserStatus)

			admin.POST("/products", handlers.AdminCreateProduct)
			admin.PUT("/products/:id", handlers.AdminUpdateProduct)
			admin.DELETE("/products/:id", handlers.AdminDeleteProduct)

			admin.GET("/groups", handlers.AdminGetGroups)
			admin.DELETE("/groups/:id", handlers.AdminDeleteGroup)

			admin.GET("/orders", handlers.AdminGetOrders)
			admin.PUT("/orders/:id/status", handlers.AdminUpdateOrderStatus)

			admin.GET("/refunds", handlers.AdminGetRefunds)
			admin.GET("/statistics", handlers.AdminGetStatistics)
		}
	}
}
