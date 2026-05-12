package config

import (
	"fmt"
	"log"
	"os"

	"moonsister/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found")
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	log.Println("Database connected successfully")

	err = DB.AutoMigrate(
		&models.User{},
		&models.Nanny{},
		&models.SkillTag{},
		&models.Customer{},
		&models.Demand{},
		&models.Order{},
		&models.Contract{},
		&models.Attendance{},
		&models.DailyRecord{},
		&models.Review{},
		&models.Dispute{},
		&models.Course{},
		&models.LearningRecord{},
		&models.NannySchedule{},
	)
	if err != nil {
		log.Fatal("Failed to migrate:", err)
	}

	log.Println("Migration completed")
	SeedData()
}
