package main

import (
	"fmt"
	"log"

	"script-management/config"
	"script-management/models"
	"script-management/routes"
	"script-management/utils"
)

func main() {
	cfg := config.LoadConfig()

	config.ConnectDB(cfg)

	if err := models.Migrate(config.DB); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migrated successfully")

	seedData()

	r := routes.SetupRouter()

	log.Printf("Server starting on port %s...", cfg.Port)
	if err := r.Run(fmt.Sprintf(":%s", cfg.Port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func seedData() {
	var adminCount int64
	config.DB.Model(&models.User{}).Where("role = ?", "admin").Count(&adminCount)

	if adminCount == 0 {
		hashedPassword, _ := utils.HashPassword("admin123")
		admin := models.User{
			Username: "admin",
			Password: hashedPassword,
			Email:    "admin@example.com",
			Nickname: "管理员",
			Role:     "admin",
		}
		config.DB.Create(&admin)
		log.Println("Default admin user created: admin / admin123")
	}

	var typeCount int64
	config.DB.Model(&models.ScriptType{}).Count(&typeCount)

	if typeCount == 0 {
		types := []models.ScriptType{
			{Name: "恐怖", Desc: "惊悚恐怖类剧本"},
			{Name: "推理", Desc: "烧脑推理类剧本"},
			{Name: "情感", Desc: "情感沉浸类剧本"},
			{Name: "欢乐", Desc: "欢乐搞笑类剧本"},
			{Name: "机制", Desc: "机制阵营类剧本"},
		}
		config.DB.Create(&types)
		log.Println("Default script types created")
	}
}
