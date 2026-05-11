package routes

import (
	"github.com/gin-gonic/gin"
	"strayanimalrescueplatform/controllers"
	"strayanimalrescueplatform/middleware"
)

func SetupRoutes(r *gin.Engine) {
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.Static("/uploads", "./uploads")

	api := r.Group("/api")
	{
		api.POST("/register", controllers.Register)
		api.POST("/login", controllers.Login)

		api.GET("/pet-categories", controllers.GetPetCategories)
		api.GET("/product-categories", controllers.GetProductCategories)
		api.GET("/categories/pet", controllers.GetPetCategories)
		api.GET("/categories/product", controllers.GetProductCategories)
		api.GET("/products", controllers.GetProducts)
		api.GET("/products/:id", controllers.GetProduct)
		api.GET("/pets", controllers.GetPets)
		api.GET("/pets/:id", controllers.GetPet)
		api.GET("/shops", controllers.GetShops)
		api.GET("/shops/:id", controllers.GetShop)
		api.GET("/lost-pets", controllers.GetLostPets)
		api.GET("/lost-pets/:id", controllers.GetLostPet)
		api.GET("/posts", controllers.GetPosts)
		api.GET("/posts/:id", controllers.GetPost)
		api.GET("/news", controllers.GetNewsList)
		api.GET("/news/:id", controllers.GetNews)

		auth := api.Group("")
		auth.Use(middleware.AuthMiddleware())
		{
			auth.GET("/user/info", controllers.GetUserInfo)
			auth.PUT("/user/info", controllers.UpdateUserInfo)
			auth.PUT("/user/password", controllers.ChangePassword)

			auth.GET("/cart", controllers.GetCart)
			auth.POST("/cart", controllers.AddToCart)
			auth.PUT("/cart/:id", controllers.UpdateCart)
			auth.DELETE("/cart/:id", controllers.RemoveFromCart)

			auth.GET("/orders", controllers.GetOrders)
			auth.GET("/orders/:id", controllers.GetOrder)
			auth.POST("/orders", controllers.CreateOrder)
			auth.POST("/orders/:id/pay", controllers.PayOrder)
			auth.POST("/orders/:id/cancel", controllers.CancelOrder)
			auth.POST("/orders/:id/confirm", controllers.ConfirmReceive)

			auth.GET("/addresses", controllers.GetAddresses)
			auth.GET("/addresses/:id", controllers.GetAddress)
			auth.POST("/addresses", controllers.CreateAddress)
			auth.PUT("/addresses/:id", controllers.UpdateAddress)
			auth.DELETE("/addresses/:id", controllers.DeleteAddress)

			auth.GET("/favorites", controllers.GetFavorites)
			auth.POST("/favorites", controllers.AddFavorite)
			auth.DELETE("/favorites/:id", controllers.RemoveFavorite)
			auth.GET("/favorites/check", controllers.CheckFavorite)

			auth.GET("/adoptions", controllers.GetAdoptions)
			auth.POST("/adoptions", controllers.ApplyAdoption)

			auth.GET("/boardings", controllers.GetBoardings)
			auth.POST("/boardings", controllers.ApplyBoarding)

			auth.POST("/lost-pets", controllers.CreateLostPet)
			auth.PUT("/lost-pets/:id", controllers.UpdateLostPet)
			auth.DELETE("/lost-pets/:id", controllers.DeleteLostPet)

			auth.POST("/posts", controllers.CreatePost)
			auth.PUT("/posts/:id", controllers.UpdatePost)
			auth.DELETE("/posts/:id", controllers.DeletePost)
			auth.POST("/posts/:id/comments", controllers.CreateComment)
			auth.GET("/my-posts", controllers.GetMyPosts)
		}

		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			admin.GET("/dashboard/stats", controllers.AdminGetDashboardStats)

			admin.GET("/users", controllers.AdminGetUsers)
			admin.POST("/users", controllers.AdminCreateUser)
			admin.PUT("/users/:id", controllers.AdminUpdateUser)
			admin.DELETE("/users/:id", controllers.AdminDeleteUser)

			admin.GET("/categories/pet", controllers.GetPetCategories)
			admin.GET("/categories/product", controllers.GetProductCategories)
			admin.POST("/pet-categories", controllers.CreatePetCategory)
			admin.POST("/product-categories", controllers.CreateProductCategory)
			admin.PUT("/pet-categories/:id", controllers.UpdatePetCategory)
			admin.PUT("/product-categories/:id", controllers.UpdateProductCategory)
			admin.DELETE("/pet-categories/:id", controllers.DeletePetCategory)
			admin.DELETE("/product-categories/:id", controllers.DeleteProductCategory)

			admin.POST("/products", controllers.CreateProduct)
			admin.PUT("/products/:id", controllers.UpdateProduct)
			admin.DELETE("/products/:id", controllers.DeleteProduct)

			admin.POST("/pets", controllers.CreatePet)
			admin.PUT("/pets/:id", controllers.UpdatePet)
			admin.DELETE("/pets/:id", controllers.DeletePet)

			admin.POST("/shops", controllers.CreateShop)
			admin.PUT("/shops/:id", controllers.UpdateShop)
			admin.DELETE("/shops/:id", controllers.DeleteShop)

			admin.POST("/news", controllers.CreateNews)
			admin.PUT("/news/:id", controllers.UpdateNews)
			admin.DELETE("/news/:id", controllers.DeleteNews)

			admin.GET("/orders", controllers.AdminGetAllOrders)
			admin.POST("/orders/:id/ship", controllers.AdminShipOrder)
			admin.POST("/orders/:id/refund", controllers.AdminRefundOrder)

			admin.GET("/adoptions", controllers.AdminGetAllAdoptions)
			admin.PUT("/adoptions/:id/status", controllers.AdminUpdateAdoptionStatus)

			admin.GET("/boardings", controllers.AdminGetAllBoardings)
			admin.PUT("/boardings/:id/status", controllers.AdminUpdateBoardingStatus)
			admin.POST("/boardings/:id/approve", controllers.AdminApproveBoarding)
			admin.POST("/boardings/:id/reject", controllers.AdminRejectBoarding)
		}
	}
}
