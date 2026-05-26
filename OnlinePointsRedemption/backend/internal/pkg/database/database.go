package database

import (
	"fmt"
	"time"

	"github.com/onlinemall/backend/internal/config"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init(cfg *config.MySQLConfig) error {
	dsn := cfg.DSN()

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("connect mysql failed: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("get sql.DB failed: %w", err)
	}

	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(time.Hour)
	sqlDB.SetConnMaxIdleTime(10 * time.Minute)

	if err = sqlDB.Ping(); err != nil {
		return fmt.Errorf("ping mysql failed: %w", err)
	}

	DB = db
	return nil
}

func Close() {
	if DB != nil {
		sqlDB, _ := DB.DB()
		if sqlDB != nil {
			sqlDB.Close()
		}
	}
}

func IsConnected() bool {
	return DB != nil
}
