package main

import (
	"student-management/database"
	"student-management/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDB()
	
	r := gin.Default()
	
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"*"},
		AllowCredentials: true,
	}))
	
	api := r.Group("/api")
	{
		students := api.Group("/students")
		{
			students.GET("", handlers.GetStudents)
			students.GET("/:id", handlers.GetStudent)
			students.POST("", handlers.CreateStudent)
			students.PUT("/:id", handlers.UpdateStudent)
			students.DELETE("/:id", handlers.DeleteStudent)
			students.POST("/batch-delete", handlers.BatchDeleteStudents)
		}
		
		courses := api.Group("/courses")
		{
			courses.GET("", handlers.GetCourses)
			courses.GET("/:id", handlers.GetCourse)
			courses.POST("", handlers.CreateCourse)
			courses.PUT("/:id", handlers.UpdateCourse)
			courses.DELETE("/:id", handlers.DeleteCourse)
			courses.POST("/batch-delete", handlers.BatchDeleteCourses)
		}
		
		grades := api.Group("/grades")
		{
			grades.GET("", handlers.GetGrades)
			grades.GET("/:id", handlers.GetGrade)
			grades.POST("", handlers.CreateGrade)
			grades.PUT("/:id", handlers.UpdateGrade)
			grades.DELETE("/:id", handlers.DeleteGrade)
			grades.POST("/batch-delete", handlers.BatchDeleteGrades)
		}
	}
	
	r.Run(":8080")
}
