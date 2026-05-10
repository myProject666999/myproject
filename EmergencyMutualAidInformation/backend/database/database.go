package database

import (
	"log"

	"emergency-mutual-aid/config"
	"emergency-mutual-aid/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	cfg := config.LoadConfig()
	var err error

	DB, err = gorm.Open(mysql.Open(cfg.GetDSN()), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = DB.AutoMigrate(
		&models.User{},
		&models.EmergencyNotice{},
		&models.Material{},
		&models.PsychologicalKnowledge{},
		&models.Recruitment{},
		&models.Volunteer{},
		&models.HelpRequest{},
		&models.Application{},
		&models.RecruitmentApplication{},
		&models.MedicalAid{},
		&models.Favorite{},
		&models.Rumor{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	seedAdmin()
}

func seedAdmin() {
	var count int64
	DB.Model(&models.User{}).Where("role = ?", "admin").Count(&count)
	if count == 0 {
		admin := models.User{
			Username: "admin",
			Password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
			Email:    "admin@example.com",
			RealName: "系统管理员",
			Role:     "admin",
			Status:   1,
		}
		DB.Create(&admin)
		log.Println("Default admin user created: username=admin, password=admin123")
	}
}
