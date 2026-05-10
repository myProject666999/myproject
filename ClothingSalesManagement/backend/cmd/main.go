package main

import (
	"clothingsales/config"
	"clothingsales/database"
	"clothingsales/models"
	"clothingsales/routes"
	"log"
	"os"

	"gorm.io/gorm"
)

func main() {
	cfg := config.LoadConfig()

	if err := os.MkdirAll("uploads", 0755); err != nil {
		log.Printf("Failed to create uploads directory: %v", err)
	}

	database.Connect(cfg)

	initAdminUser()

	r := routes.SetupRoutes(cfg)

	log.Printf("Server starting on port %s...", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func initAdminUser() {
	var admin models.User
	result := database.DB.Where("username = ?", "admin").First(&admin)

	if result.Error == gorm.ErrRecordNotFound {
		admin := models.User{
			Username: "admin",
			Nickname: "管理员",
			Role:     "admin",
			Status:   1,
		}
		if err := admin.HashPassword("admin123"); err != nil {
			log.Printf("Failed to hash admin password: %v", err)
			return
		}
		if err := database.DB.Create(&admin).Error; err != nil {
			log.Printf("Failed to create admin user: %v", err)
			return
		}
		log.Println("Admin user created successfully: admin / admin123")
	}
}
