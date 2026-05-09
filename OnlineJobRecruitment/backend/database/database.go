package database

import (
	"fmt"
	"log"
	"online-job-recruitment/config"
	"online-job-recruitment/models"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		config.AppConfig.DBUser,
		config.AppConfig.DBPassword,
		config.AppConfig.DBHost,
		config.AppConfig.DBPort,
		config.AppConfig.DBName,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatal("Failed to get sql.DB:", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
	sqlDB.SetConnMaxIdleTime(10 * time.Minute)

	log.Println("Database connected successfully")
}

func AutoMigrate() {
	DB.AutoMigrate(
		&models.User{},
		&models.JobType{},
		&models.Job{},
		&models.Resume{},
		&models.Application{},
		&models.Exercise{},
		&models.News{},
		&models.Favorite{},
		&models.Interview{},
		&models.Review{},
	)
	log.Println("Database migration completed")
}

func SeedData() {
	var adminCount int64
	DB.Model(&models.User{}).Where("role = ?", "admin").Count(&adminCount)
	if adminCount == 0 {
		admin := models.User{
			Username: "admin",
			Password: "admin123",
			Role:     "admin",
			Name:     "系统管理员",
			Phone:    "13800138000",
			Email:    "admin@example.com",
			Status:   1,
		}
		admin.SetPassword("admin123")
		DB.Create(&admin)
		log.Println("Default admin account created: admin / admin123")
	}

	var recruiterCount int64
	DB.Model(&models.User{}).Where("role = ?", "recruiter").Count(&recruiterCount)
	if recruiterCount == 0 {
		recruiter := models.User{
			Username:   "recruiter",
			Password:   "recruiter123",
			Role:       "recruiter",
			Name:       "招聘人员",
			Company:    "测试公司",
			Position:   "HR经理",
			Phone:      "13900139000",
			Email:      "recruiter@example.com",
			Status:     1,
		}
		recruiter.SetPassword("recruiter123")
		DB.Create(&recruiter)
		log.Println("Default recruiter account created: recruiter / recruiter123")
	}
}
