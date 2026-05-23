package database

import (
	"fmt"
	"log"
	"online-voting/config"
	"online-voting/internal/model"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init(cfg *config.Config) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPass, cfg.DBHost, cfg.DBPort, cfg.DBName)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	if err := DB.AutoMigrate(
		&model.User{},
		&model.Activity{},
		&model.Option{},
		&model.VoteRecord{},
		&model.LotteryRecord{},
	); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	log.Println("database connected successfully")
}
