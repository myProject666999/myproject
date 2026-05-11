package routes

import (
	"jingang-hotel-backend/controllers"
	"jingang-hotel-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(middlewares.CORSMiddleware())

	userController := &controllers.UserController{}
	roomController := &controllers.RoomController{}
	orderController := &controllers.OrderController{}
	reviewController := &controllers.ReviewController{}
	memberController := &controllers.MemberController{}
	adminController := &controllers.AdminController{}

	api := r.Group("/api")

	// 公共接口
	api.POST("/register", userController.Register)
	api.POST("/login", userController.Login)
	api.POST("/admin/login", userController.AdminLogin)
	api.GET("/room-types", roomController.GetRoomTypes)
	api.GET("/rooms/available", roomController.GetAvailableRooms)
	api.GET("/reviews", reviewController.GetReviews)
	api.GET("/products", memberController.GetProducts)

	// 用户接口
	userGroup := api.Group("/user")
	userGroup.Use(middlewares.AuthMiddleware())
	userGroup.Use(middlewares.UserMiddleware())
	{
		userGroup.GET("/profile", userController.GetProfile)
		userGroup.PUT("/profile", userController.UpdateProfile)
		userGroup.POST("/change-password", userController.ChangePassword)

		userGroup.POST("/orders", orderController.CreateOrder)
		userGroup.GET("/orders", orderController.GetOrders)
		userGroup.GET("/orders/:id", orderController.GetOrderDetail)
		userGroup.POST("/orders/:id/pay", orderController.PayOrder)
		userGroup.POST("/orders/:id/cancel", orderController.CancelOrder)
		userGroup.POST("/orders/:id/apply-cancel", orderController.ApplyCancelOrder)

		userGroup.POST("/reviews", reviewController.CreateReview)
		userGroup.GET("/my-reviews", reviewController.GetMyReviews)

		userGroup.GET("/points-records", memberController.GetPointsRecords)
		userGroup.POST("/exchange-product", memberController.ExchangeProduct)
		userGroup.GET("/product-orders", memberController.GetProductOrders)
	}

	// 管理员接口
	adminGroup := api.Group("/admin")
	adminGroup.Use(middlewares.AuthMiddleware())
	adminGroup.Use(middlewares.AdminMiddleware())
	{
		adminGroup.POST("/change-password", userController.ChangePassword)

		adminGroup.GET("/admins", adminController.GetAdmins)
		adminGroup.POST("/admins", adminController.CreateAdmin)
		adminGroup.PUT("/admins/:id", adminController.UpdateAdmin)
		adminGroup.DELETE("/admins/:id", adminController.DeleteAdmin)

		adminGroup.GET("/users", adminController.GetUsers)
		adminGroup.PUT("/users/:id", adminController.UpdateUser)

		adminGroup.GET("/room-types", roomController.GetAdminRoomTypes)
		adminGroup.POST("/room-types", roomController.CreateRoomType)
		adminGroup.PUT("/room-types/:id", roomController.UpdateRoomType)
		adminGroup.DELETE("/room-types/:id", roomController.DeleteRoomType)

		adminGroup.GET("/rooms", roomController.GetAdminRooms)
		adminGroup.POST("/rooms", roomController.CreateRoom)
		adminGroup.PUT("/rooms/:id", roomController.UpdateRoom)
		adminGroup.DELETE("/rooms/:id", roomController.DeleteRoom)

		adminGroup.GET("/orders", orderController.GetAdminOrders)
		adminGroup.PUT("/orders/:id/status", orderController.UpdateOrderStatus)

		adminGroup.GET("/reviews", reviewController.GetAdminReviews)
		adminGroup.PUT("/reviews/:id/audit", reviewController.AuditReview)

		adminGroup.GET("/products", memberController.GetAdminProducts)
		adminGroup.POST("/products", memberController.CreateProduct)
		adminGroup.PUT("/products/:id", memberController.UpdateProduct)
		adminGroup.DELETE("/products/:id", memberController.DeleteProduct)

		adminGroup.GET("/statistics", orderController.GetStatistics)
	}

	return r
}
