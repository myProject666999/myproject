package routes

import (
	"campus-trading/controllers"
	"campus-trading/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
			auth.POST("/admin-login", controllers.AdminLogin)
		}

		public := api.Group("/public")
		{
			public.GET("/banners", controllers.GetPublicBanners)
			public.GET("/news", controllers.GetPublicNews)
			public.GET("/news/:id", controllers.GetNewsDetail)
			public.GET("/categories", controllers.GetCategories)
			public.GET("/products", controllers.GetProducts)
			public.GET("/products/hot", controllers.GetHotProducts)
			public.GET("/products/new", controllers.GetNewProducts)
			public.GET("/products/:id", controllers.GetProduct)
			public.GET("/products/:id/comments", controllers.GetComments)
		}

		user := api.Group("/user")
		user.Use(middleware.JWTAuth())
		{
			user.GET("/profile", controllers.GetCurrentUser)
			user.PUT("/profile", controllers.UpdateCurrentUser)
			user.PUT("/password", controllers.ChangePassword)

			user.GET("/addresses", controllers.GetAddresses)
			user.GET("/addresses/:id", controllers.GetAddress)
			user.POST("/addresses", controllers.CreateAddress)
			user.PUT("/addresses/:id", controllers.UpdateAddress)
			user.DELETE("/addresses/:id", controllers.DeleteAddress)
			user.PUT("/addresses/:id/default", controllers.SetDefaultAddress)

			user.GET("/cart", controllers.GetCart)
			user.GET("/cart/count", controllers.GetCartCount)
			user.POST("/cart", controllers.AddToCart)
			user.PUT("/cart/:id", controllers.UpdateCart)
			user.DELETE("/cart/:id", controllers.DeleteCart)
			user.DELETE("/cart", controllers.ClearCart)

			user.POST("/products/:id/favorite", controllers.ToggleFavorite)
			user.GET("/products/:id/favorite", controllers.IsFavorite)
			user.GET("/favorites", controllers.GetFavorites)
			user.POST("/products/:id/comments", controllers.AddComment)

			user.GET("/orders", controllers.GetOrders)
			user.GET("/orders/:id", controllers.GetOrder)
			user.POST("/orders", controllers.CreateOrder)
			user.POST("/orders/:id/pay", controllers.PayOrder)
			user.POST("/orders/:id/cancel", controllers.CancelOrder)
			user.POST("/orders/:id/confirm", controllers.ConfirmOrder)
			user.POST("/orders/:id/refund", controllers.RequestRefund)
		}

		admin := api.Group("/admin")
		admin.Use(middleware.JWTAuth(), middleware.AdminAuth())
		{
			admin.GET("/dashboard/stats", controllers.DashboardStats)

			admin.GET("/users", controllers.GetAdminUsers)
			admin.DELETE("/users/:id", controllers.DeleteAdminUser)
			admin.PUT("/users/:id/status", controllers.UpdateUserStatus)

			admin.GET("/categories", controllers.GetAdminCategories)
			admin.POST("/categories", controllers.CreateCategory)
			admin.PUT("/categories/:id", controllers.UpdateCategory)
			admin.DELETE("/categories/:id", controllers.DeleteCategory)

			admin.GET("/products", controllers.GetAdminProducts)
			admin.POST("/products", controllers.CreateProduct)
			admin.GET("/products/:id", controllers.GetProduct)
			admin.PUT("/products/:id", controllers.UpdateProduct)
			admin.DELETE("/products/:id", controllers.DeleteProduct)
			admin.GET("/products/:id/comments", controllers.GetProductCommentsAdmin)
			admin.DELETE("/comments/:id", controllers.DeleteComment)

			admin.GET("/banners", controllers.GetBanners)
			admin.POST("/banners", controllers.CreateBanner)
			admin.PUT("/banners/:id", controllers.UpdateBanner)
			admin.DELETE("/banners/:id", controllers.DeleteBanner)

			admin.GET("/news", controllers.GetAdminNews)
			admin.POST("/news", controllers.CreateNews)
			admin.GET("/news/:id", controllers.GetNewsDetail)
			admin.PUT("/news/:id", controllers.UpdateNews)
			admin.DELETE("/news/:id", controllers.DeleteNews)

			admin.GET("/orders", controllers.GetAdminOrders)
			admin.GET("/orders/:id", controllers.GetAdminOrder)
			admin.POST("/orders/:id/ship", controllers.ShipOrder)
		}
	}
}
