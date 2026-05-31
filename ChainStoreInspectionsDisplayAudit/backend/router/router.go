package router

import (
	"chain-store-inspection/config"
	"chain-store-inspection/controllers"
	"chain-store-inspection/middleware"

	"github.com/gin-gonic/gin"
)

var (
	taskController        = controllers.NewTaskController()
	checklistController   = controllers.NewChecklistController()
	recordController      = controllers.NewRecordController()
	photoController       = controllers.NewPhotoController()
	issueController       = controllers.NewIssueController()
	rectificationController = controllers.NewRectificationController()
	syncController        = controllers.NewSyncController()
	scoreController       = controllers.NewScoreController()
	reportController      = controllers.NewReportController()
)

func SetupRouter(r *gin.Engine) {
	r.Use(middleware.CORS())

	r.Static("/uploads/photos", config.AppConfig.Upload.PhotoPath)

	public := r.Group("/api")
	{
		public.POST("/auth/login", controllers.Login)
	}

	api := r.Group("/api")
	api.Use(middleware.JWTAuth())
	{
		auth := api.Group("/auth")
		{
			auth.POST("/logout", controllers.Logout)
			auth.GET("/userinfo", controllers.GetUserInfo)
		}

		stores := api.Group("/stores")
		{
			stores.GET("", controllers.GetStoreList)
			stores.GET("/:id", controllers.GetStoreDetail)
			stores.POST("", controllers.CreateStore)
			stores.PUT("/:id", controllers.UpdateStore)
			stores.DELETE("/:id", controllers.DeleteStore)
		}

		tasks := api.Group("/tasks")
		{
			tasks.GET("", taskController.GetTaskList)
			tasks.GET("/:id", taskController.GetTaskDetail)
			tasks.POST("", taskController.CreateTask)
			tasks.PUT("/:id", taskController.UpdateTask)
			tasks.DELETE("/:id", taskController.DeleteTask)
			tasks.POST("/:id/start", taskController.StartTask)
			tasks.POST("/:id/complete", taskController.CompleteTask)
		}

		templates := api.Group("/templates")
		{
			templates.GET("", checklistController.GetTemplateList)
			templates.GET("/:id", checklistController.GetTemplateDetail)
			templates.POST("", checklistController.CreateTemplate)
			templates.PUT("/:id", checklistController.UpdateTemplate)
			templates.DELETE("/:id", checklistController.DeleteTemplate)
			templates.GET("/:id/items", checklistController.GetTemplateItems)
			templates.POST("/:id/items", checklistController.CreateItem)
		}

		items := api.Group("/items")
		{
			items.PUT("/:id", checklistController.UpdateItem)
			items.DELETE("/:id", checklistController.DeleteItem)
		}

		records := api.Group("/records")
		{
			records.GET("", recordController.GetRecordList)
			records.GET("/:id", recordController.GetRecordDetail)
			records.POST("", recordController.CreateRecord)
			records.PUT("/:id", recordController.UpdateRecord)
			records.DELETE("/:id", recordController.DeleteRecord)
		}

		photos := api.Group("/photos")
		{
			photos.GET("", photoController.GetPhotoList)
			photos.GET("/:id", photoController.GetPhotoDetail)
			photos.POST("/upload", photoController.UploadPhoto)
			photos.DELETE("/:id", photoController.DeletePhoto)
		}

		issues := api.Group("/issues")
		{
			issues.GET("", issueController.GetIssueList)
			issues.GET("/:id", issueController.GetIssueDetail)
			issues.POST("", issueController.CreateIssue)
			issues.PUT("/:id", issueController.UpdateIssue)
			issues.DELETE("/:id", issueController.DeleteIssue)
			issues.POST("/:id/assign", issueController.AssignIssue)
		}

		rectifications := api.Group("/rectifications")
		{
			rectifications.GET("", rectificationController.GetRectificationList)
			rectifications.GET("/:id", rectificationController.GetRectificationDetail)
			rectifications.POST("", rectificationController.CreateRectification)
			rectifications.PUT("/:id", rectificationController.UpdateRectification)
			rectifications.POST("/:id/submit", rectificationController.SubmitRectification)
			rectifications.POST("/:id/recheck", rectificationController.RecheckRectification)
		}

		sync := api.Group("/sync")
		{
			sync.POST("/upload", syncController.Upload)
			sync.GET("/pending", syncController.GetPending)
			sync.POST("/confirm", syncController.Confirm)
			sync.GET("/history", syncController.GetSyncHistory)
		}

		scores := api.Group("/scores")
		{
			scores.GET("/ranking", scoreController.GetRanking)
			scores.GET("/store/:id", scoreController.GetStoreScore)
			scores.GET("/trend", scoreController.GetTrend)
			scores.POST("/aggregate", scoreController.AggregateScores)
		}

		reports := api.Group("/reports")
		{
			reports.GET("", reportController.GetReportList)
			reports.GET("/:id", reportController.GetReportDetail)
			reports.POST("", reportController.CreateReport)
			reports.POST("/generate/task/:id", reportController.GenerateTaskReport)
		}
	}
}
