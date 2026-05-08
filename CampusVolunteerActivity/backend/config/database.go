package config

import (
	"fmt"
	"log"

	"campus-volunteer-system/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB(cfg *Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	log.Println("Database connected successfully")

	DB = db
	return db, nil
}

func AutoMigrate(db *gorm.DB) error {
	err := db.AutoMigrate(
		&models.User{},
		&models.Activity{},
		&models.Registration{},
		&models.Comment{},
		&models.Carousel{},
		&models.PointsRecord{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate database: %v", err)
	}

	log.Println("Database migration completed successfully")
	return nil
}

func SeedAdminUser(db *gorm.DB) error {
	var count int64
	db.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&count)
	
	if count > 0 {
		log.Println("Admin user already exists, skipping seed")
		return nil
	}

	admin := &models.User{
		Username: "admin",
		Email:    "admin@example.com",
		Role:     models.RoleAdmin,
		RealName: "系统管理员",
		Status:   "active",
	}

	if err := admin.HashPassword("admin123"); err != nil {
		return err
	}

	if err := db.Create(admin).Error; err != nil {
		return fmt.Errorf("failed to create admin user: %v", err)
	}

	log.Println("Admin user created successfully: username=admin, password=admin123")
	return nil
}
