package router

import (
	"time"

	"vehicle-parking/backend/config"
	"vehicle-parking/backend/handlers"
	"vehicle-parking/backend/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB, cfg *config.Config) *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.RequestLogger())

	authHandler := handlers.NewAuthHandler(db, *cfg)
	vehicleHandler := handlers.NewVehicleHandler(db)
	spotHandler := handlers.NewParkingSpotHandler(db)
	recordHandler := handlers.NewAccessRecordHandler(db)
	ruleHandler := handlers.NewBillingRuleHandler(db)
	cardHandler := handlers.NewMonthlyCardHandler(db)
	paymentHandler := handlers.NewPaymentHandler(db)
	dashboardHandler := handlers.NewDashboardHandler(db)

	api := r.Group("/api")
	{
		api.POST("/auth/login", authHandler.Login)

		auth := api.Group("")
		auth.Use(middleware.AuthMiddleware(cfg.JWT))
		{
			auth.GET("/auth/userinfo", authHandler.GetUserInfo)

			vehicles := auth.Group("/vehicles")
			{
				vehicles.GET("", vehicleHandler.List)
				vehicles.GET("/:id", vehicleHandler.GetById)
				vehicles.GET("/plate/:plate", vehicleHandler.GetByPlate)
				vehicles.POST("", vehicleHandler.Create)
				vehicles.PUT("/:id", vehicleHandler.Update)
				vehicles.DELETE("/:id", vehicleHandler.Delete)
				vehicles.PUT("/:id/status", vehicleHandler.UpdateStatus)
			}

			spots := auth.Group("/spots")
			{
				spots.GET("", spotHandler.List)
				spots.GET("/:id", spotHandler.GetById)
				spots.GET("/realtime/status", spotHandler.RealTimeStatus)
				spots.GET("/statistics/overview", spotHandler.Statistics)
				spots.GET("/areas/list", spotHandler.AreaList)
				spots.POST("", spotHandler.Create)
				spots.PUT("/:id", spotHandler.Update)
				spots.DELETE("/:id", spotHandler.Delete)
				spots.PUT("/:id/status", spotHandler.UpdateStatus)
			}

			records := auth.Group("/records")
			{
				records.GET("", recordHandler.List)
				records.GET("/:id", recordHandler.GetById)
				records.GET("/plate/:plate/active", recordHandler.GetActiveByPlate)
				records.GET("/calculate/fee", recordHandler.CalculateFee)
				records.GET("/statistics/overview", recordHandler.Statistics)
				records.GET("/statistics/trend", recordHandler.Trend)
				records.POST("/entry", recordHandler.Entry)
				records.POST("/exit", recordHandler.Exit)
				records.POST("/assign-spot", recordHandler.AssignSpot)
				records.POST("/:id/pay", recordHandler.Pay)
				records.POST("/manual/entry", recordHandler.ManualEntry)
				records.POST("/manual/exit", recordHandler.ManualExit)
			}

			rules := auth.Group("/rules")
			{
				rules.GET("", ruleHandler.List)
				rules.GET("/:id", ruleHandler.GetById)
				rules.POST("", ruleHandler.Create)
				rules.PUT("/:id", ruleHandler.Update)
				rules.DELETE("/:id", ruleHandler.Delete)
				rules.PUT("/:id/status", ruleHandler.UpdateStatus)
			}

			cards := auth.Group("/cards")
			{
				cards.GET("", cardHandler.List)
				cards.GET("/:id", cardHandler.GetById)
				cards.GET("/vehicle/:vehicle_id", cardHandler.GetByVehicle)
				cards.GET("/plate/:plate", cardHandler.GetByPlate)
				cards.GET("/statistics/overview", cardHandler.Statistics)
				cards.GET("/expiring/list", cardHandler.ExpiringList)
				cards.POST("", cardHandler.Create)
				cards.POST("/:id/renew", cardHandler.Renew)
				cards.POST("/:id/refund", cardHandler.Refund)
			}

			payments := auth.Group("/payments")
			{
				payments.GET("", paymentHandler.List)
				payments.GET("/:id", paymentHandler.GetById)
				payments.GET("/statistics/overview", paymentHandler.Statistics)
			}

			dashboard := auth.Group("/dashboard")
			{
				dashboard.GET("/overview", dashboardHandler.Overview)
				dashboard.GET("/recent-records", dashboardHandler.RecentRecords)
				dashboard.GET("/expiring-cards", dashboardHandler.MonthlyCardsExpiring)
				dashboard.GET("/spot-usage", dashboardHandler.SpotUsageRate)
			}
		}
	}

	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"time":   time.Now().Format("2006-01-02 15:04:05"),
		})
	})

	return r
}
