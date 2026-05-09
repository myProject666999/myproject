package routes

import (
	"github.com/epidemic-system/handlers"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	api := r.Group("/api")
	{
		students := api.Group("/students")
		{
			students.GET("", handlers.GetStudents)
			students.GET("/search", handlers.SearchStudents)
			students.GET("/:id", handlers.GetStudent)
			students.POST("", handlers.CreateStudent)
			students.PUT("/:id", handlers.UpdateStudent)
			students.DELETE("/:id", handlers.DeleteStudent)
		}

		teachers := api.Group("/teachers")
		{
			teachers.GET("", handlers.GetTeachers)
			teachers.GET("/search", handlers.SearchTeachers)
			teachers.GET("/:id", handlers.GetTeacher)
			teachers.POST("", handlers.CreateTeacher)
			teachers.PUT("/:id", handlers.UpdateTeacher)
			teachers.DELETE("/:id", handlers.DeleteTeacher)
		}

		visitors := api.Group("/visitors")
		{
			visitors.GET("", handlers.GetVisitors)
			visitors.GET("/search", handlers.SearchVisitors)
			visitors.GET("/:id", handlers.GetVisitor)
			visitors.POST("", handlers.CreateVisitor)
			visitors.PUT("/:id", handlers.UpdateVisitor)
			visitors.DELETE("/:id", handlers.DeleteVisitor)
		}

		blacklists := api.Group("/blacklists")
		{
			blacklists.GET("", handlers.GetBlacklists)
			blacklists.GET("/search", handlers.SearchBlacklists)
			blacklists.GET("/:id", handlers.GetBlacklist)
			blacklists.POST("", handlers.CreateBlacklist)
			blacklists.PUT("/:id", handlers.UpdateBlacklist)
			blacklists.DELETE("/:id", handlers.DeleteBlacklist)
		}
	}
}
