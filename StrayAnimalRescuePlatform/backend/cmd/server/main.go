package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"strayanimalrescueplatform/config"
	"strayanimalrescueplatform/models"
	"strayanimalrescueplatform/routes"
	"strayanimalrescueplatform/utils"
)

func main() {
	cfg := config.LoadConfig()

	utils.SetJWTSecret(cfg.JWTSecret)

	err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer config.DB.Close()

	db := config.GetDB()

	modelsToMigrate := []interface{}{
		&models.User{},
		&models.PetCategory{},
		&models.ProductCategory{},
		&models.Product{},
		&models.Pet{},
		&models.Adoption{},
		&models.Shop{},
		&models.Boarding{},
		&models.LostPet{},
		&models.Post{},
		&models.Comment{},
		&models.News{},
		&models.Order{},
		&models.OrderItem{},
		&models.Cart{},
		&models.Address{},
		&models.Favorite{},
	}

	for _, model := range modelsToMigrate {
		if !db.HasTable(model) {
			db.CreateTable(model)
			log.Printf("Created table for %T", model)
		} else {
			db.AutoMigrate(model)
		}
	}

	var adminCount int
	if err := db.Model(&models.User{}).Where("role = ?", "admin").Count(&adminCount).Error; err != nil {
		log.Printf("Warning: Failed to count admins: %v", err)
		adminCount = 0
	}
	if adminCount == 0 {
		admin := models.User{
			Username: "admin",
			Password: "admin123",
			Email:    "admin@example.com",
			Nickname: "管理员",
			Role:     "admin",
		}
		if err := db.Create(&admin).Error; err != nil {
			log.Printf("Warning: Failed to create admin: %v", err)
		} else {
			log.Println("默认管理员账号已创建: admin / admin123")
		}
	}

	r := gin.Default()
	routes.SetupRoutes(r)

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server starting on %s", addr)
	r.Run(addr)
}
