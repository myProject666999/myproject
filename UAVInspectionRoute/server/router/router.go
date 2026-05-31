package router

import (
	"github.com/gin-gonic/gin"
	"uav-inspection-server/handler"
	"uav-inspection-server/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.New()
	r.Use(middleware.Logger())
	r.Use(middleware.CORS())
	r.Use(gin.Recovery())

	auth := r.Group("/api/auth")
	{
		auth.POST("/register", handler.Register)
		auth.POST("/login", handler.Login)
		auth.GET("/info", middleware.Auth(), handler.GetUserInfo)
	}

	api := r.Group("/api")
	api.Use(middleware.Auth())
	{
		areas := api.Group("/areas")
		{
			areas.POST("", handler.CreateArea)
			areas.GET("", handler.ListAreas)
			areas.GET("/:id", handler.GetArea)
			areas.PUT("/:id", handler.UpdateArea)
			areas.DELETE("/:id", handler.DeleteArea)
		}

		nfz := api.Group("/no-fly-zones")
		{
			nfz.POST("", handler.CreateNoFlyZone)
			nfz.GET("", handler.ListNoFlyZones)
			nfz.GET("/:id", handler.GetNoFlyZone)
			nfz.PUT("/:id", handler.UpdateNoFlyZone)
			nfz.DELETE("/:id", handler.DeleteNoFlyZone)
			nfz.POST("/check", handler.CheckNoFlyZone)
		}

		routes := api.Group("/routes")
		{
			routes.POST("", handler.CreateRoute)
			routes.GET("", handler.ListRoutes)
			routes.GET("/:id", handler.GetRoute)
			routes.PUT("/:id", handler.UpdateRoute)
			routes.DELETE("/:id", handler.DeleteRoute)
			routes.POST("/:id/points", handler.AddRoutePoint)
			routes.DELETE("/:id/points/:point_id", handler.DeleteRoutePoint)
			routes.POST("/:id/validate-no-fly-zone", handler.ValidateRouteNoFlyZone)
		}

		drones := api.Group("/drones")
		{
			drones.POST("", handler.CreateDrone)
			drones.GET("", handler.ListDrones)
			drones.GET("/:id", handler.GetDrone)
			drones.PUT("/:id", handler.UpdateDrone)
			drones.DELETE("/:id", handler.DeleteDrone)
		}

		tasks := api.Group("/tasks")
		{
			tasks.POST("", handler.CreateTask)
			tasks.GET("", handler.ListTasks)
			tasks.GET("/:id", handler.GetTask)
			tasks.PUT("/:id", handler.UpdateTask)
			tasks.DELETE("/:id", handler.DeleteTask)
			tasks.PUT("/:id/status", handler.UpdateTaskStatus)
			tasks.GET("/:id/status-logs", handler.GetTaskStatusLogs)
			tasks.PUT("/:id/assign-drone", handler.AssignDroneToTask)
		}

		media := api.Group("/media")
		{
			media.POST("", handler.CreateMedia)
			media.GET("", handler.ListMedia)
			media.GET("/:id", handler.GetMedia)
			media.PUT("/:id", handler.UpdateMedia)
			media.DELETE("/:id", handler.DeleteMedia)
			media.POST("/chunk/init", handler.InitChunkUpload)
			media.POST("/chunk/upload", handler.UploadChunk)
			media.POST("/chunk/merge", handler.MergeChunks)
			media.PUT("/:id/complete", handler.CompleteUpload)
		}

		annotations := api.Group("/annotations")
		{
			annotations.POST("", handler.CreateAnnotation)
			annotations.GET("", handler.ListAnnotations)
			annotations.GET("/:id", handler.GetAnnotation)
			annotations.PUT("/:id", handler.UpdateAnnotation)
			annotations.DELETE("/:id", handler.DeleteAnnotation)
		}

		reports := api.Group("/reports")
		{
			reports.POST("", handler.CreateReport)
			reports.GET("", handler.ListReports)
			reports.GET("/:id", handler.GetReport)
			reports.PUT("/:id", handler.UpdateReport)
			reports.DELETE("/:id", handler.DeleteReport)
			reports.POST("/:id/generate", handler.GenerateReport)
		}

		comparisons := api.Group("/comparisons")
		{
			comparisons.POST("", handler.CreateComparison)
			comparisons.GET("", handler.ListComparisons)
			comparisons.GET("/:id", handler.GetComparison)
			comparisons.PUT("/:id", handler.UpdateComparison)
			comparisons.DELETE("/:id", handler.DeleteComparison)
			comparisons.POST("/:id/execute", handler.ExecuteComparison)
		}
	}

	return r
}
