package router

import (
	"emergency-material/internal/api"
	"emergency-material/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter(engine *gin.Engine) {
	engine.Use(middleware.CORS())
	engine.Use(middleware.Logger())

	authCtrl := api.NewAuthController()
	materialCtrl := api.NewMaterialController()
	warehouseCtrl := api.NewWarehouseController()
	inventoryCtrl := api.NewInventoryController()
	stockCtrl := api.NewStockController()
	expiryCtrl := api.NewExpiryController()
	transferCtrl := api.NewTransferController()
	demandCtrl := api.NewDemandController()

	engine.POST("/api/auth/login", authCtrl.Login)

	authGroup := engine.Group("/api")
	authGroup.Use(middleware.JWTAuth())
	{
		authGroup.POST("/auth/logout", authCtrl.Logout)
		authGroup.GET("/auth/info", authCtrl.GetInfo)
	}

	materialGroup := engine.Group("/api/materials")
	materialGroup.Use(middleware.JWTAuth())
	{
		materialGroup.GET("", materialCtrl.GetList)
		materialGroup.GET("/:id", materialCtrl.GetDetail)
		materialGroup.POST("", materialCtrl.Create)
		materialGroup.PUT("/:id", materialCtrl.Update)
		materialGroup.DELETE("/:id", materialCtrl.Delete)
		materialGroup.GET("/categories/all", materialCtrl.GetCategoryList)
		materialGroup.POST("/categories", materialCtrl.CreateCategory)
		materialGroup.PUT("/categories/:id", materialCtrl.UpdateCategory)
		materialGroup.DELETE("/categories/:id", materialCtrl.DeleteCategory)
	}

	warehouseGroup := engine.Group("/api/warehouses")
	warehouseGroup.Use(middleware.JWTAuth())
	{
		warehouseGroup.GET("", warehouseCtrl.GetList)
		warehouseGroup.GET("/:id", warehouseCtrl.GetDetail)
		warehouseGroup.POST("", warehouseCtrl.Create)
		warehouseGroup.PUT("/:id", warehouseCtrl.Update)
		warehouseGroup.DELETE("/:id", warehouseCtrl.Delete)
	}

	inventoryGroup := engine.Group("/api/inventory")
	inventoryGroup.Use(middleware.JWTAuth())
	{
		inventoryGroup.GET("", inventoryCtrl.GetList)
		inventoryGroup.GET("/summary", inventoryCtrl.GetSummary)
		inventoryGroup.GET("/:id", inventoryCtrl.GetDetail)
	}

	stockGroup := engine.Group("/api/stock")
	stockGroup.Use(middleware.JWTAuth())
	{
		stockGroup.POST("/in", stockCtrl.StockIn)
		stockGroup.POST("/out", stockCtrl.StockOut)
		stockGroup.GET("/records", stockCtrl.GetRecords)
	}

	expiryGroup := engine.Group("/api/expiry")
	expiryGroup.Use(middleware.JWTAuth())
	{
		expiryGroup.GET("/alerts", expiryCtrl.GetAlerts)
		expiryGroup.PUT("/alerts/:id/handle", expiryCtrl.HandleAlert)
		expiryGroup.POST("/check", expiryCtrl.CheckExpiry)
	}

	transferGroup := engine.Group("/api/transfers")
	transferGroup.Use(middleware.JWTAuth())
	{
		transferGroup.GET("", transferCtrl.GetList)
		transferGroup.GET("/:id", transferCtrl.GetDetail)
		transferGroup.POST("", transferCtrl.Create)
		transferGroup.PUT("/:id", transferCtrl.Update)
		transferGroup.POST("/:id/submit", transferCtrl.Submit)
		transferGroup.POST("/:id/approve", transferCtrl.Approve)
		transferGroup.POST("/:id/reject", transferCtrl.Reject)
		transferGroup.POST("/:id/send", transferCtrl.Send)
		transferGroup.POST("/:id/receive", transferCtrl.Receive)
		transferGroup.POST("/:id/complete", transferCtrl.Complete)
		transferGroup.POST("/:id/cancel", transferCtrl.Cancel)
	}

	demandGroup := engine.Group("/api/demands")
	demandGroup.Use(middleware.JWTAuth())
	{
		demandGroup.GET("", demandCtrl.GetList)
		demandGroup.GET("/:id", demandCtrl.GetDetail)
		demandGroup.POST("", demandCtrl.Create)
		demandGroup.PUT("/:id", demandCtrl.Update)
		demandGroup.POST("/:id/submit", demandCtrl.Submit)
		demandGroup.POST("/:id/approve", demandCtrl.Approve)
		demandGroup.POST("/:id/reject", demandCtrl.Reject)
		demandGroup.POST("/:id/complete", demandCtrl.Complete)
	}

	dashboardGroup := engine.Group("/api/dashboard")
	dashboardGroup.Use(middleware.JWTAuth())
	{
		dashboardGroup.GET("", materialCtrl.GetDashboardData)
	}
}
