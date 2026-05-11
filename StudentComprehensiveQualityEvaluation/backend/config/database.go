package config

import (
	"log"
	"student_quality_system/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	cfg := LoadConfig()
	var err error
	
	DB, err = gorm.Open(mysql.Open(cfg.GetDSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	
	log.Println("Database connected successfully")
	
	err = DB.AutoMigrate(
		&models.User{},
		&models.Teacher{},
		&models.Student{},
		&models.Grade{},
		&models.RewardPunishment{},
		&models.AbilityPoint{},
		&models.Evaluation{},
		&models.Message{},
		&models.Permission{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	
	log.Println("Database migration completed")
	return DB
}
