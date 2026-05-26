package routes

import (
	"offlinedownloader/app/controllers"
	"offlinedownloader/app/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORS())

	api := r.Group("/api")
	{
		downloadController := controllers.NewDownloadController()
		fileController := controllers.NewFileController()

		tasks := api.Group("/tasks")
		{
			tasks.POST("", downloadController.AddDownload)
			tasks.GET("", downloadController.GetTaskList)
			tasks.GET("/:id", downloadController.GetTaskDetail)
			tasks.PUT("/:id/pause", downloadController.PauseTask)
			tasks.PUT("/:id/resume", downloadController.ResumeTask)
			tasks.DELETE("/:id", downloadController.DeleteTask)
			tasks.PUT("/pause-all", downloadController.PauseAll)
			tasks.PUT("/resume-all", downloadController.ResumeAll)
			tasks.DELETE("/clear-completed", downloadController.ClearCompleted)
		}

		files := api.Group("/files")
		{
			files.GET("", fileController.GetFileList)
			files.GET("/statistics", fileController.GetStatistics)
			files.GET("/:id", fileController.GetFileDetail)
			files.DELETE("/:id", fileController.DeleteFile)
			files.GET("/:id/play", fileController.PlayFile)
			files.GET("/:id/download", fileController.DownloadFile)
			files.GET("/:id/thumbnail", fileController.GetThumbnail)
			files.GET("/task/:task_id", fileController.GetFilesByTaskID)
			files.POST("/scan", fileController.ScanDirectory)
		}

		api.GET("/statistics", downloadController.GetStatistics)
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Offline Downloader API is running",
		})
	})

	return r
}
