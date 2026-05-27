package database

import (
	"fmt"
	"log"
	"offlinedownloader/app/models"
	"offlinedownloader/config"
	"offlinedownloader/database/scripts"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local&collation=utf8mb4_unicode_ci",
		config.AppConfig.DBUser,
		config.AppConfig.DBPassword,
		config.AppConfig.DBHost,
		config.AppConfig.DBPort,
		config.AppConfig.DBName,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Printf("Failed to connect to database: %v", err)
		log.Println("Attempting to create database...")
		scripts.CreateDatabase()
		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
			DisableForeignKeyConstraintWhenMigrating: true,
		})
		if err != nil {
			log.Fatalf("Failed to connect to database after creation: %v", err)
		}
	}

	DB.Exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci")
	DB.Exec("SET CHARACTER SET utf8mb4")

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("Failed to get database instance: %v", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Database connection established successfully")
}

func AutoMigrate() {
	err := DB.AutoMigrate(
		&models.DownloadTask{},
		&models.File{},
		&models.Setting{},
	)
	if err != nil {
		log.Fatalf("Failed to auto migrate: %v", err)
	}

	sqlDB, _ := DB.DB()
	scripts.InitDefaultSettings(sqlDB)

	log.Println("Database migration completed")
}
