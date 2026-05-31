package repository

import (
	"database/sql"
	"fmt"
	"load-testing/config"
	appLogger "load-testing/pkg/logger"
	"load-testing/internal/model"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	gormLogger "gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() error {
	cfg := config.AppConfig.Database
	
	rootDSN := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.User, cfg.Password, cfg.Host, cfg.Port)
	
	tmpDB, err := sql.Open("mysql", rootDSN)
	if err != nil {
		return fmt.Errorf("failed to connect to mysql: %w", err)
	}
	defer tmpDB.Close()
	
	_, err = tmpDB.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", cfg.Name))
	if err != nil {
		return fmt.Errorf("failed to create database: %w", err)
	}
	
	dsn := config.AppConfig.Database.DSN()
	
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: gormLogger.Default.LogMode(gormLogger.Info),
	})
	if err != nil {
		return err
	}
	
	err = DB.AutoMigrate(
		&model.User{},
		&model.Target{},
		&model.Task{},
		&model.TaskNode{},
		&model.Metric{},
		&model.Report{},
		&model.Baseline{},
		&model.Comparison{},
		&model.Alarm{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate tables: %w", err)
	}
	
	var count int64
	DB.Model(&model.User{}).Where("username = ?", "admin").Count(&count)
	if count == 0 {
		admin := &model.User{
			Username: "admin",
			Password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
			Role:     2,
			Status:   1,
		}
		DB.Create(admin)
		appLogger.Info("Default admin user created")
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	appLogger.Info("Database connection established")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
