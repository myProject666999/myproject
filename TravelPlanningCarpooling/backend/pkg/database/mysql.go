package database

import (
	"carpooling/config"
	"log"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init() error {
	var err error
	DB, err = gorm.Open(mysql.Open(config.AppConfig.MySQL.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return err
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	sqlDB.SetMaxIdleConns(config.AppConfig.MySQL.MaxIdleConns)
	sqlDB.SetMaxOpenConns(config.AppConfig.MySQL.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("MySQL connected successfully")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
