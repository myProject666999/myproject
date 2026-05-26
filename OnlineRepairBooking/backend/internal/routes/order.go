package routes

import (
	"online-repair-booking/internal/handlers"
	"online-repair-booking/internal/middleware"
	"online-repair-booking/pkg/database"

	"github.com/labstack/echo/v4"
)

func RegisterOrderRoutes(g *echo.Group) {
	db := database.MySQL
	orderHandler := handlers.NewOrderHandler(db)
	bidHandler := handlers.NewBidHandler(db)

	userGroup := g.Group("/orders", middleware.JWTAuth())
	{
		userGroup.POST("", orderHandler.CreateOrder)
		userGroup.GET("", orderHandler.GetOrderList)
		userGroup.GET("/:id", orderHandler.GetOrderDetail)
		userGroup.POST("/:id/cancel", orderHandler.CancelOrder)
		userGroup.GET("/:id/bids", bidHandler.GetOrderBids)
		userGroup.POST("/bids/accept", bidHandler.AcceptBid)
	}

	workerGroup := g.Group("/worker/orders", middleware.JWTAuth())
	{
		workerGroup.GET("", orderHandler.WorkerGetOrderList)
		workerGroup.GET("/pending", orderHandler.GetPendingOrders)
		workerGroup.POST("/:id/accept", orderHandler.WorkerAcceptOrder)
		workerGroup.POST("/:id/start", orderHandler.WorkerStartService)
		workerGroup.POST("/:id/complete", orderHandler.WorkerCompleteService)
		workerGroup.POST("/:id/grab", bidHandler.PlaceBid)
	}

	adminGroup := g.Group("/admin/orders", middleware.JWTAuth())
	{
		adminGroup.POST("/auto-dispatch", bidHandler.AutoDispatch)
	}
}
