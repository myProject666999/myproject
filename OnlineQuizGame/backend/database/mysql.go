package database

import (
	"log"
	"online-quiz-game/config"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var MySQLDB *gorm.DB

func InitMySQL(cfg *config.Config) error {
	var err error
	MySQLDB, err = gorm.Open(mysql.Open(cfg.MySQLDSN), &gorm.Config{})
	if err != nil {
		return err
	}

	sqlDB, err := MySQLDB.DB()
	if err != nil {
		return err
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("MySQL connected successfully")
	return nil
}

func CloseMySQL() {
	if MySQLDB != nil {
		sqlDB, _ := MySQLDB.DB()
		if sqlDB != nil {
			sqlDB.Close()
		}
	}
}
