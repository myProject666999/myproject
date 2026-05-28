package database

import (
	"battery-cabinet/config"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitMySQL() error {
	var logMode logger.LogLevel
	if config.AppConfig.Server.Mode == "debug" {
		logMode = logger.Info
	} else {
		logMode = logger.Warn
	}

	db, err := gorm.Open(mysql.Open(config.AppConfig.MySQL.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logMode),
	})
	if err != nil {
		return err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return err
	}

	sqlDB.SetMaxOpenConns(config.AppConfig.MySQL.MaxOpenConns)
	sqlDB.SetMaxIdleConns(config.AppConfig.MySQL.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(time.Duration(config.AppConfig.MySQL.ConnMaxLifetime) * time.Second)

	DB = db
	return nil
}
