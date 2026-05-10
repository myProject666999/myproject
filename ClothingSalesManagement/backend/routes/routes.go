package routes

import (
	"clothingsales/config"
	"clothingsales/controllers"
	"clothingsales/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(cfg *config.Config) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.Static("/uploads", "./uploads")

	authController := controllers.NewAuthController(cfg)
	userController := controllers.NewUserController()
	productController := controllers.NewProductController()
	categoryController := controllers.NewCategoryController()
	bannerController := controllers.NewBannerController()
	configController := controllers.NewConfigController()
	cartController := controllers.NewCartController()
	addressController := controllers.NewAddressController()
	orderController := controllers.NewOrderController()
	paymentController := controllers.NewPaymentController()
	uploadController := controllers.NewUploadController()

	api := r.Group("/api")
	{
		api.POST("/register", authController.Register)
		api.POST("/login", authController.Login)

		api.GET("/banners", bannerController.GetBanners)
		api.GET("/categories", productController.GetCategoryTree)
		api.GET("/products", productController.GetProductList)
		api.GET("/products/:id", productController.GetProductDetail)
		api.GET("/hot-products", configController.GetHotProducts)
		api.GET("/new-products", configController.GetNewProducts)
		api.GET("/recommend-products", configController.GetRecommendProducts)

		auth := api.Group("")
		auth.Use(middleware.AuthMiddleware(cfg))
		{
			auth.POST("/logout", authController.Logout)
			auth.GET("/user/me", authController.GetCurrentUser)
			auth.PUT("/user/profile", userController.UpdateProfile)

			auth.GET("/cart", cartController.GetCart)
			auth.POST("/cart", cartController.AddToCart)
			auth.PUT("/cart/:id", cartController.UpdateCart)
			auth.DELETE("/cart/:id", cartController.RemoveFromCart)
			auth.DELETE("/cart", cartController.ClearCart)

			auth.GET("/addresses", addressController.GetAddresses)
			auth.POST("/addresses", addressController.CreateAddress)
			auth.PUT("/addresses/:id", addressController.UpdateAddress)
			auth.DELETE("/addresses/:id", addressController.DeleteAddress)

			auth.GET("/orders", orderController.GetOrderList)
			auth.GET("/orders/:id", orderController.GetOrderDetail)
			auth.POST("/orders", orderController.CreateOrder)

			auth.POST("/pay", paymentController.Pay)
			auth.POST("/orders/:id/pay", paymentController.MockPay)

			auth.POST("/upload", uploadController.UploadImage)
		}

		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(cfg))
		admin.Use(middleware.AdminMiddleware())
		{
			admin.GET("/users", userController.GetUserList)
			admin.PUT("/users/:id/disable", userController.DisableUser)
			admin.PUT("/users/:id/enable", userController.EnableUser)

			admin.GET("/categories", categoryController.GetCategories)
			admin.POST("/categories", categoryController.CreateCategory)
			admin.PUT("/categories/:id", categoryController.UpdateCategory)
			admin.DELETE("/categories/:id", categoryController.DeleteCategory)

			admin.GET("/products", productController.AdminGetProductList)
			admin.POST("/products", productController.CreateProduct)
			admin.PUT("/products/:id", productController.UpdateProduct)
			admin.DELETE("/products/:id", productController.DeleteProduct)
			admin.PUT("/products/:id/on-shelf", productController.OnShelfProduct)
			admin.PUT("/products/:id/off-shelf", productController.OffShelfProduct)

			admin.GET("/banners", bannerController.AdminGetBanners)
			admin.POST("/banners", bannerController.CreateBanner)
			admin.PUT("/banners/:id", bannerController.UpdateBanner)
			admin.DELETE("/banners/:id", bannerController.DeleteBanner)

			admin.GET("/hot-products", configController.AdminGetHotProducts)
			admin.POST("/hot-products", configController.CreateHotProduct)
			admin.DELETE("/hot-products/:id", configController.DeleteHotProduct)

			admin.GET("/new-products", configController.AdminGetNewProducts)
			admin.POST("/new-products", configController.CreateNewProduct)
			admin.DELETE("/new-products/:id", configController.DeleteNewProduct)

			admin.GET("/recommend-products", configController.AdminGetRecommendProducts)
			admin.POST("/recommend-products", configController.CreateRecommendProduct)
			admin.DELETE("/recommend-products/:id", configController.DeleteRecommendProduct)

			admin.GET("/orders", orderController.AdminGetOrderList)
			admin.PUT("/orders/:id/ship", orderController.ShipOrder)
			admin.PUT("/orders/:id/deliver", orderController.DeliverOrder)
			admin.PUT("/orders/:id/close", orderController.CloseOrder)
		}
	}

	return r
}
