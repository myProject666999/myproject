package router

import (
	"battery-cabinet/internal/handler"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.StaticFS("/web", http.Dir("./web"))
	r.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusFound, "/web/index.html")
	})

	api := r.Group("/api")
	{
		api.POST("/auth/login", handler.Login)
		api.GET("/dashboard", handler.GetDashboard)

		auth := api.Group("")
		{
			cabinet := auth.Group("/cabinet")
			{
				cabinet.GET("/list", handler.GetCabinetList)
				cabinet.GET("/map", handler.GetCabinetMap)
				cabinet.GET("/stats", handler.GetCabinetStats)
				cabinet.GET("/:id", handler.GetCabinetDetail)
				cabinet.POST("", handler.CreateCabinet)
				cabinet.PUT("/:id", handler.UpdateCabinet)
				cabinet.POST("/exchange", handler.BatteryExchange)
			}

			battery := auth.Group("/battery")
			{
				battery.GET("/list", handler.GetBatteryList)
				battery.GET("/stats", handler.GetBatteryStats)
				battery.GET("/:id", handler.GetBatteryDetail)
				battery.GET("/:id/history", handler.GetBatteryStatusHistory)
				battery.POST("/report", handler.ReportBatteryStatus)
				battery.POST("/offline", handler.OfflineBattery)
			}

			order := auth.Group("/order")
			{
				order.GET("/list", handler.GetOrderList)
				order.GET("/stats", handler.GetOrderStats)
				order.GET("/:id", handler.GetOrderDetail)
			}

			pkg := auth.Group("/package")
			{
				pkg.GET("/list", handler.GetPackageList)
				pkg.GET("/user/:user_id", handler.GetUserPackageList)
				pkg.POST("/purchase", handler.PurchasePackage)
			}

			wallet := auth.Group("/wallet")
			{
				wallet.GET("/:user_id", handler.GetWallet)
				wallet.POST("/recharge", handler.RechargeWallet)
				wallet.POST("/consume", handler.ConsumeWallet)
				wallet.GET("/transaction/list", handler.GetTransactionList)
			}

			dispatch := auth.Group("/dispatch")
			{
				dispatch.GET("/task/list", handler.GetDispatchTaskList)
				dispatch.GET("/task/:id", handler.GetDispatchTaskDetail)
				dispatch.POST("/task", handler.CreateDispatchTask)
				dispatch.POST("/task/assign", handler.AssignDispatchTask)
				dispatch.POST("/task/:id/start", handler.StartDispatchTask)
				dispatch.POST("/task/complete", handler.CompleteDispatchTask)
				dispatch.GET("/gaps", handler.GetDispatchGaps)
				dispatch.POST("/plan", handler.GenerateDispatchPlan)
				dispatch.POST("/auto-create", handler.AutoCreateDispatchTasks)
				dispatch.GET("/operator/list", handler.GetOperatorList)
			}

			alert := auth.Group("/alert")
			{
				alert.GET("/list", handler.GetAlertList)
				alert.GET("/stats", handler.GetAlertStats)
				alert.GET("/:id", handler.GetAlertDetail)
				alert.POST("", handler.CreateAlert)
				alert.POST("/handle", handler.HandleAlert)
				alert.POST("/check-battery", handler.CheckAndCreateBatteryAlerts)
			}

			user := auth.Group("/user")
			{
				user.GET("/list", handler.GetUserList)
			}
		}
	}

	return r
}
