package routes

import (
	"student_quality_system/controllers"
	"student_quality_system/middlewares"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))
	
	api := r.Group("/api")
	
	api.POST("/login", controllers.Login)
	
	auth := api.Group("")
	auth.Use(middlewares.AuthMiddleware())
	{
		auth.GET("/user/me", controllers.GetCurrentUser)
		auth.PUT("/user/profile", controllers.UpdateProfile)
		auth.PUT("/user/password", controllers.ChangePassword)
		auth.GET("/permissions/my", controllers.GetPermissions)
		
		teachers := auth.Group("/teachers")
		teachers.Use(middlewares.PermissionMiddleware("teachers"))
		{
			teachers.GET("", controllers.GetTeachers)
			teachers.GET("/:id", controllers.GetTeacher)
			teachers.POST("", controllers.CreateTeacher)
			teachers.PUT("/:id", controllers.UpdateTeacher)
			teachers.DELETE("/:id", controllers.DeleteTeacher)
		}
		
		students := auth.Group("/students")
		students.Use(middlewares.PermissionMiddleware("students"))
		{
			students.GET("", controllers.GetStudents)
			students.GET("/:id", controllers.GetStudent)
			students.POST("", controllers.CreateStudent)
			students.PUT("/:id", controllers.UpdateStudent)
			students.DELETE("/:id", controllers.DeleteStudent)
		}
		
		grades := auth.Group("/grades")
		grades.Use(middlewares.PermissionMiddleware("grades"))
		{
			grades.GET("", controllers.GetGrades)
			grades.GET("/:id", controllers.GetGrade)
			grades.POST("", controllers.CreateGrade)
			grades.PUT("/:id", controllers.UpdateGrade)
			grades.DELETE("/:id", controllers.DeleteGrade)
		}
		
		rewards := auth.Group("/rewards")
		rewards.Use(middlewares.PermissionMiddleware("rewards"))
		{
			rewards.GET("", controllers.GetRewards)
			rewards.GET("/:id", controllers.GetReward)
			rewards.POST("", controllers.CreateReward)
			rewards.PUT("/:id", controllers.UpdateReward)
			rewards.DELETE("/:id", controllers.DeleteReward)
		}
		
		ability := auth.Group("/ability")
		ability.Use(middlewares.PermissionMiddleware("ability"))
		{
			ability.GET("", controllers.GetAbilityPoints)
			ability.GET("/:id", controllers.GetAbilityPoint)
			ability.POST("", controllers.CreateAbilityPoint)
			ability.PUT("/:id", controllers.UpdateAbilityPoint)
			ability.DELETE("/:id", controllers.DeleteAbilityPoint)
		}
		
		evaluations := auth.Group("/evaluations")
		evaluations.Use(middlewares.PermissionMiddleware("evaluation"))
		{
			evaluations.GET("", controllers.GetEvaluations)
			evaluations.GET("/:id", controllers.GetEvaluation)
			evaluations.POST("", controllers.CreateEvaluation)
			evaluations.PUT("/:id", controllers.UpdateEvaluation)
			evaluations.DELETE("/:id", controllers.DeleteEvaluation)
		}
		
		messages := auth.Group("/messages")
		messages.Use(middlewares.PermissionMiddleware("messages"))
		{
			messages.GET("", controllers.GetMessages)
			messages.GET("/:id", controllers.GetMessage)
			messages.POST("", controllers.CreateMessage)
			messages.PUT("/:id/reply", controllers.ReplyMessage)
			messages.DELETE("/:id", controllers.DeleteMessage)
		}
		
		permissions := auth.Group("/permissions")
		permissions.Use(middlewares.AdminOnly())
		{
			permissions.GET("", controllers.GetAllPermissions)
			permissions.GET("/:role", controllers.GetRolePermissions)
			permissions.PUT("/:id", controllers.UpdatePermission)
			permissions.POST("/batch", controllers.BatchUpdatePermissions)
		}
	}
	
	return r
}
