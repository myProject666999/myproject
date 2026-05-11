package database

import (
	"log"
	"watercharge/config"
	"watercharge/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("watercharge.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	models.AutoMigrate(DB)
	initDefaultAdmin()
}

func initDefaultAdmin() {
	var count int64
	DB.Model(&models.Admin{}).Count(&count)
	if count == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(config.DefaultAdminPassword), bcrypt.DefaultCost)
		admin := models.Admin{
			Username: config.DefaultAdminUsername,
			Password: string(hashedPassword),
			Name:     "系统管理员",
			Role:     "admin",
		}
		DB.Create(&admin)
		log.Println("Default admin created: admin/123456")
	}
}
