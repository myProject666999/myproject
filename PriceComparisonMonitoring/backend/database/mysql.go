package database

import (
	"log"
	"price-monitor/config"
	"price-monitor/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDatabase(cfg *config.DatabaseConfig) (*gorm.DB, error) {
	dsn := cfg.DSN()

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	DB = db
	log.Println("Database connected successfully")

	err = autoMigrate(db)
	if err != nil {
		log.Printf("Auto migration warning: %v", err)
	}

	return db, nil
}

func autoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.ProductGroup{},
		&models.Product{},
		&models.PriceHistory{},
		&models.AlertSetting{},
		&models.AlertLog{},
		&models.CrawlLog{},
		&models.AntiCrawlConfig{},
	)
}

func CloseDatabase() {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err == nil {
			sqlDB.Close()
		}
	}
}
