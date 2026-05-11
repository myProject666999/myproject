package config

import (
	"campus-trading/models"
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(config *Config) error {
	var err error
	
	for i := 0; i < 3; i++ {
		DB, err = gorm.Open(mysql.Open(config.GetDSN()), &gorm.Config{})
		if err == nil {
			break
		}
		log.Printf("Failed to connect to database (attempt %d): %v", i+1, err)
	}
	
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	log.Println("Database connected successfully")
	return nil
}

func MigrateDB() error {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Address{},
		&models.Category{},
		&models.Product{},
		&models.Comment{},
		&models.Favorite{},
		&models.Cart{},
		&models.Order{},
		&models.OrderItem{},
		&models.Banner{},
		&models.News{},
		&models.Payment{},
	)
	if err != nil {
		return err
	}
	log.Println("Database migration completed")
	return nil
}
