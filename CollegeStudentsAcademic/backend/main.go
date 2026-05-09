package main

import (
	"college-academic/config"
	"college-academic/controllers"
	"college-academic/database"
	"college-academic/middleware"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()
	database.InitDB()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.Static("/uploads", "./uploads")
	os.MkdirAll("./uploads", 0755)

	r.GET("/api/home", controllers.GetHomeData)
	r.POST("/api/upload", controllers.UploadFile)

	adminGroup := r.Group("/api/admin")
	{
		adminGroup.POST("/login", controllers.AdminLogin)
		adminGroup.GET("/info", middleware.AuthMiddleware("admin"), controllers.GetAdminInfo)
		adminGroup.POST("/password", middleware.AuthMiddleware("admin"), controllers.ChangeAdminPassword)
		adminGroup.GET("/stats", middleware.AuthMiddleware("admin"), controllers.GetDashboardStats)

		adminAdmins := adminGroup.Group("/admins")
		adminAdmins.Use(middleware.AuthMiddleware("admin"))
		{
			adminAdmins.GET("", controllers.GetAdminList)
			adminAdmins.POST("", controllers.CreateAdmin)
			adminAdmins.DELETE("/:id", controllers.DeleteAdmin)
		}

		adminStudents := adminGroup.Group("/students")
		adminStudents.Use(middleware.AuthMiddleware("admin"))
		{
			adminStudents.GET("", controllers.GetStudentList)
			adminStudents.GET("/:id", controllers.GetStudentDetail)
			adminStudents.PUT("/:id", controllers.UpdateStudent)
			adminStudents.DELETE("/:id", controllers.DeleteStudent)
			adminStudents.POST("/:id/audit", controllers.AuditStudent)
		}

		adminServices := adminGroup.Group("/services")
		adminServices.Use(middleware.AuthMiddleware("admin"))
		{
			adminServices.GET("", controllers.GetServiceList)
			adminServices.GET("/:id", controllers.GetServiceDetail)
			adminServices.POST("", controllers.CreateService)
			adminServices.PUT("/:id", controllers.UpdateService)
			adminServices.DELETE("/:id", controllers.DeleteService)
		}

		adminAppointments := adminGroup.Group("/appointments")
		adminAppointments.Use(middleware.AuthMiddleware("admin"))
		{
			adminAppointments.GET("", controllers.GetAllAppointments)
			adminAppointments.GET("/:id", controllers.GetAppointmentDetail)
			adminAppointments.PUT("/:id", controllers.UpdateAppointment)
			adminAppointments.DELETE("/:id", controllers.DeleteAppointment)
		}

		adminKnowledge := adminGroup.Group("/knowledge")
		adminKnowledge.Use(middleware.AuthMiddleware("admin"))
		{
			adminKnowledge.GET("", controllers.GetKnowledgeList)
			adminKnowledge.GET("/:id", controllers.GetKnowledgeDetail)
			adminKnowledge.POST("", controllers.CreateKnowledge)
			adminKnowledge.PUT("/:id", controllers.UpdateKnowledge)
			adminKnowledge.DELETE("/:id", controllers.DeleteKnowledge)
			adminKnowledge.GET("/:id/download", controllers.DownloadAttachment)
		}

		adminMessages := adminGroup.Group("/messages")
		adminMessages.Use(middleware.AuthMiddleware("admin"))
		{
			adminMessages.GET("", controllers.GetAllMessages)
			adminMessages.GET("/:id", controllers.GetMessageDetail)
			adminMessages.POST("/:id/reply", controllers.ReplyMessage)
			adminMessages.DELETE("/:id", controllers.DeleteMessage)
		}
	}

	studentGroup := r.Group("/api/student")
	{
		studentGroup.POST("/register", controllers.StudentRegister)
		studentGroup.POST("/login", controllers.StudentLogin)

		studentAuth := studentGroup.Group("")
		studentAuth.Use(middleware.AuthMiddleware("student"))
		{
			studentAuth.GET("/profile", controllers.GetStudentProfile)
			studentAuth.PUT("/profile", controllers.UpdateStudentProfile)
			studentAuth.POST("/password", controllers.ChangeStudentPassword)

			studentAuth.GET("/appointments", controllers.GetStudentAppointments)
			studentAuth.POST("/appointments", controllers.CreateAppointment)
			studentAuth.PUT("/appointments/:id", controllers.UpdateAppointment)
			studentAuth.DELETE("/appointments/:id", controllers.DeleteAppointment)

			studentAuth.GET("/messages", controllers.GetStudentMessages)
			studentAuth.POST("/messages", controllers.CreateMessage)
		}
	}

	publicGroup := r.Group("/api")
	{
		publicGroup.GET("/services", controllers.GetServiceList)
		publicGroup.GET("/services/:id", controllers.GetServiceDetail)
		publicGroup.GET("/service-categories", controllers.GetServiceCategories)

		publicGroup.GET("/knowledge", controllers.GetKnowledgeList)
		publicGroup.GET("/knowledge/:id", controllers.GetKnowledgeDetail)
		publicGroup.GET("/knowledge/:id/download", controllers.DownloadAttachment)
		publicGroup.GET("/knowledge-categories", controllers.GetKnowledgeCategories)
	}

	r.Run(":" + config.AppConfig.Port)
}
