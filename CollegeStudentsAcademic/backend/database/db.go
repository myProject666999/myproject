package database

import (
	"college-academic/config"
	"college-academic/models"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(mysql.Open(config.GetDSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connected successfully")

	err = DB.AutoMigrate(
		&models.Admin{},
		&models.Student{},
		&models.Service{},
		&models.Appointment{},
		&models.Knowledge{},
		&models.Message{},
		&models.News{},
		&models.Banner{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migrated successfully")
	initSeedData()
}

func initSeedData() {
	var count int64
	DB.Model(&models.Admin{}).Count(&count)
	if count == 0 {
		admin := models.Admin{
			Username: "admin",
			Password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
			RealName: "系统管理员",
		}
		DB.Create(&admin)
		log.Println("Default admin created: admin / admin123")
	}
}
