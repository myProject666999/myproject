package routes

import (
	"unmanned-container/controllers"
	"unmanned-container/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())
	r.Use(middleware.ErrorHandler())

	containerController := controllers.NewContainerController()
	productController := controllers.NewProductController()
	replenisherController := controllers.NewReplenisherController()
	inventoryController := controllers.NewInventoryController()
	saleController := controllers.NewSaleController()
	replenishmentController := controllers.NewReplenishmentController()
	stockCheckController := controllers.NewStockCheckController()

	api := r.Group("/api")
	{
		containers := api.Group("/containers")
		{
			containers.GET("", containerController.GetList)
			containers.GET("/all", containerController.GetAll)
			containers.GET("/:id", containerController.GetByID)
			containers.POST("", containerController.Create)
			containers.PUT("/:id", containerController.Update)
			containers.DELETE("/:id", containerController.Delete)
		}

		products := api.Group("/products")
		{
			products.GET("", productController.GetList)
			products.GET("/all", productController.GetAll)
			products.GET("/categories", productController.GetCategories)
			products.GET("/:id", productController.GetByID)
			products.POST("", productController.Create)
			products.PUT("/:id", productController.Update)
			products.DELETE("/:id", productController.Delete)
		}

		replenishers := api.Group("/replenishers")
		{
			replenishers.GET("", replenisherController.GetList)
			replenishers.GET("/all", replenisherController.GetAll)
			replenishers.GET("/:id", replenisherController.GetByID)
			replenishers.POST("", replenisherController.Create)
			replenishers.PUT("/:id", replenisherController.Update)
			replenishers.DELETE("/:id", replenisherController.Delete)
		}

		inventory := api.Group("/inventory")
		{
			inventory.GET("", inventoryController.GetList)
			inventory.GET("/low-stock", inventoryController.GetLowStockItems)
			inventory.GET("/:id", inventoryController.GetByID)
			inventory.POST("", inventoryController.Create)
			inventory.PUT("/:id", inventoryController.Update)
			inventory.DELETE("/:id", inventoryController.Delete)
		}

		sales := api.Group("/sales")
		{
			sales.GET("", saleController.GetList)
			sales.GET("/statistics", saleController.GetStatistics)
			sales.GET("/container-stats", saleController.GetContainerStats)
			sales.GET("/product-stats", saleController.GetProductStats)
			sales.GET("/:id", saleController.GetByID)
			sales.POST("", saleController.Create)
			sales.POST("/refund", saleController.Refund)
		}

		replenishment := api.Group("/replenishment")
		{
			replenishment.GET("", replenishmentController.GetList)
			replenishment.GET("/:id", replenishmentController.GetByID)
			replenishment.POST("/generate", replenishmentController.GenerateTasks)
			replenishment.POST("/:id/dispatch", replenishmentController.DispatchTask)
			replenishment.POST("/:id/start", replenishmentController.StartTask)
			replenishment.POST("/execute", replenishmentController.ExecuteTask)
			replenishment.POST("/:id/cancel", replenishmentController.CancelTask)
		}

		stockCheck := api.Group("/stock-check")
		{
			stockCheck.GET("", stockCheckController.GetCheckList)
			stockCheck.GET("/:id", stockCheckController.GetCheckByID)
			stockCheck.POST("", stockCheckController.CreateCheck)
			stockCheck.POST("/process", stockCheckController.ProcessCheck)
		}

		damage := api.Group("/damage")
		{
			damage.GET("", stockCheckController.GetDamageList)
			damage.POST("", stockCheckController.CreateDamageRecord)
		}
	}
}
