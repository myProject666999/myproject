package routes

import (
	"shuttle-booking/controllers"
	"shuttle-booking/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.Use(middleware.CORSMiddleware())

	api := r.Group("/api")

	auth := api.Group("/auth")
	{
		auth.POST("/login", controllers.Login)
	}

	employee := api.Group("/employees")
	employee.Use(middleware.AuthMiddleware())
	{
		employee.GET("", controllers.GetEmployees)
		employee.GET("/:id", controllers.GetEmployee)
		employee.POST("", controllers.CreateEmployee)
		employee.PUT("/:id", controllers.UpdateEmployee)
	}

	station := api.Group("/stations")
	station.Use(middleware.AuthMiddleware())
	{
		station.GET("", controllers.GetStations)
		station.GET("/:id", controllers.GetStation)
		station.POST("", controllers.CreateStation)
		station.PUT("/:id", controllers.UpdateStation)
		station.DELETE("/:id", controllers.DeleteStation)
	}

	route := api.Group("/routes")
	route.Use(middleware.AuthMiddleware())
	{
		route.GET("", controllers.GetRoutes)
		route.GET("/map", controllers.GetRouteMap)
		route.GET("/:id", controllers.GetRoute)
		route.POST("", controllers.CreateRoute)
		route.PUT("/:id", controllers.UpdateRoute)
		route.DELETE("/:id", controllers.DeleteRoute)
	}

	shuttle := api.Group("/shuttles")
	shuttle.Use(middleware.AuthMiddleware())
	{
		shuttle.GET("", controllers.GetShuttles)
		shuttle.GET("/:id", controllers.GetShuttle)
		shuttle.POST("", controllers.CreateShuttle)
		shuttle.PUT("/:id", controllers.UpdateShuttle)
		shuttle.DELETE("/:id", controllers.DeleteShuttle)
	}

	schedule := api.Group("/schedules")
	schedule.Use(middleware.AuthMiddleware())
	{
		schedule.GET("", controllers.GetSchedules)
		schedule.GET("/:id", controllers.GetSchedule)
		schedule.POST("", controllers.CreateSchedule)
		schedule.PUT("/:id", controllers.UpdateSchedule)
		schedule.DELETE("/:id", controllers.DeleteSchedule)
	}

	reservation := api.Group("/reservations")
	reservation.Use(middleware.AuthMiddleware())
	{
		reservation.GET("", controllers.GetReservations)
		reservation.GET("/:id", controllers.GetReservation)
		reservation.POST("", controllers.CreateReservation)
		reservation.POST("/:id/cancel", controllers.CancelReservation)
		reservation.POST("/:id/rebook", controllers.RebookReservation)
		reservation.POST("/:id/qrcode", controllers.GenerateReservationQR)
	}

	verify := api.Group("/verify")
	verify.Use(middleware.AuthMiddleware())
	{
		verify.POST("/qrcode", controllers.VerifyQRCode)
		verify.GET("/records", controllers.GetVerifyRecords)
	}

	warning := api.Group("/warnings")
	warning.Use(middleware.AuthMiddleware())
	{
		warning.GET("", controllers.GetCapacityWarnings)
		warning.GET("/stats", controllers.GetWarningStats)
		warning.POST("/:id/handle", controllers.HandleWarning)
	}

	optimization := api.Group("/optimization")
	optimization.Use(middleware.AuthMiddleware())
	{
		optimization.GET("", controllers.GetOptimizationSuggestions)
		optimization.POST("/generate", controllers.GenerateOptimizationSuggestions)
		optimization.POST("/:id/handle", controllers.HandleSuggestion)
	}

	analysis := api.Group("/analysis")
	analysis.Use(middleware.AuthMiddleware())
	{
		analysis.GET("/overall", controllers.GetOverallStats)
		analysis.GET("/route-ranking", controllers.GetRouteRanking)
		analysis.GET("/station-ranking", controllers.GetStationRanking)
		analysis.GET("/daily-trend", controllers.GetDailyTrend)
		analysis.GET("/department", controllers.GetDepartmentStats)
		analysis.GET("/time-distribution", controllers.GetTimeDistribution)
		analysis.GET("/verification", controllers.GetVerificationStats)
	}
}
