package database

import (
	"fmt"
	"log"
	"time"

	"examination-registration/config"
	"examination-registration/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	config.LoadConfig()
	
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		config.AppConfig.DBUser,
		config.AppConfig.DBPassword,
		config.AppConfig.DBHost,
		config.AppConfig.DBPort,
		config.AppConfig.DBName,
	)

	var err error
	maxRetries := 10
	for i := 0; i < maxRetries; i++ {
		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			log.Println("Database connected successfully")
			break
		}
		log.Printf("Failed to connect to database (attempt %d/%d): %v", i+1, maxRetries, err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatalf("Failed to connect to database after %d attempts: %v", maxRetries, err)
	}

	migrate()
	seedData()
}

func migrate() {
	err := DB.AutoMigrate(
		&models.User{},
		&models.SchoolIntro{},
		&models.IntroLike{},
		&models.IntroDislike{},
		&models.Favorite{},
		&models.EnrollmentProject{},
		&models.Cart{},
		&models.Order{},
		&models.OrderItem{},
		&models.Address{},
		&models.ExamPaper{},
		&models.Question{},
		&models.QuestionOption{},
		&models.ForumPost{},
		&models.ExamRecord{},
		&models.ExamAnswer{},
		&models.WrongQuestion{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migrated successfully")
}

func seedData() {
	correctHash := "$2a$10$/OH/JODHn20nQ2jAftc8qeffy5cCz7yuXewhFQUGaKFw9aQfkw66e"
	
	var admin models.User
	result := DB.Where("username = ?", "admin").First(&admin)
	if result.Error != nil {
		admin = models.User{
			Username: "admin",
			Password: correctHash,
			Email:    "admin@example.com",
			Nickname: "系统管理员",
			Role:     "admin",
			Status:   1,
		}
		DB.Create(&admin)
		log.Println("Admin user created: admin / password123")
	} else {
		result := DB.Model(&models.User{}).Where("id = ?", admin.ID).Update("password", correctHash)
		if result.Error != nil {
			log.Printf("Failed to update admin password: %v", result.Error)
		} else {
			log.Printf("Admin user password reset to: password123 (rows affected: %d)", result.RowsAffected)
		}
		DB.Model(&models.User{}).Where("id = ?", admin.ID).Update("role", "admin")
		DB.Model(&models.User{}).Where("id = ?", admin.ID).Update("status", 1)
	}

	var testUser models.User
	result = DB.Where("username = ?", "testuser").First(&testUser)
	if result.Error != nil {
		testUser = models.User{
			Username: "testuser",
			Password: correctHash,
			Email:    "test@example.com",
			Nickname: "测试用户",
			Role:     "user",
			Status:   1,
		}
		DB.Create(&testUser)
		log.Println("Test user created: testuser / password123")
	} else {
		result := DB.Model(&models.User{}).Where("id = ?", testUser.ID).Update("password", correctHash)
		if result.Error != nil {
			log.Printf("Failed to update testuser password: %v", result.Error)
		} else {
			log.Printf("Test user password reset to: password123 (rows affected: %d)", result.RowsAffected)
		}
		DB.Model(&models.User{}).Where("id = ?", testUser.ID).Update("status", 1)
	}
}
