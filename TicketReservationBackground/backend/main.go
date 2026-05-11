package main

import (
	"log"
	"os"

	"ticketreservation/controllers"
	"ticketreservation/database"
	"ticketreservation/middleware"
	"ticketreservation/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file")
	}

	database.ConnectDatabase()
	database.DB.AutoMigrate(
		&models.User{},
		&models.Flight{},
		&models.Order{},
		&models.Comment{},
	)

	seedAdmin()
	database.SeedDatabase(database.DB)

	r := gin.Default()
	r.Use(cors.Default())

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
		}

		flights := api.Group("/flights")
		{
			flights.GET("", controllers.GetFlights)
			flights.GET("/:id", controllers.GetFlight)
		}

		comments := api.Group("/comments")
		{
			comments.GET("", controllers.GetComments)
		}

		authGroup := api.Group("")
		authGroup.Use(middleware.AuthMiddleware())
		{
			authGroup.GET("/user/profile", controllers.GetProfile)
			authGroup.PUT("/user/profile", controllers.UpdateProfile)
			authGroup.POST("/orders", controllers.CreateOrder)
			authGroup.GET("/orders", controllers.GetMyOrders)
			authGroup.GET("/orders/:id", controllers.GetOrder)
			authGroup.POST("/comments", controllers.CreateComment)

			admin := authGroup.Group("/admin")
			admin.Use(middleware.AdminMiddleware())
			{
				admin.GET("/users", controllers.GetUsers)
				admin.DELETE("/users/:id", controllers.DeleteUser)

				admin.POST("/flights", controllers.CreateFlight)
				admin.PUT("/flights/:id", controllers.UpdateFlight)
				admin.DELETE("/flights/:id", controllers.DeleteFlight)

				admin.GET("/orders", controllers.GetAllOrders)

				admin.GET("/comments", controllers.GetAllComments)
				admin.DELETE("/comments/:id", controllers.DeleteComment)
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}

func seedAdmin() {
	var count int64
	database.DB.Model(&models.User{}).Where("role = ?", "admin").Count(&count)
	if count == 0 {
		admin := models.User{
			Username: "admin",
			Password: "admin123",
			Email:    "admin@ticket.com",
			Role:     "admin",
			Name:     "系统管理员",
			Phone:    "13800138000",
		}
		admin.HashPassword()
		database.DB.Create(&admin)
		log.Println("Created default admin account: username=admin, password=admin123")
	}
}
