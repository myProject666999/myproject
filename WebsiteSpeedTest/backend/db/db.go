package db

import (
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"

	"websitespeedtest/model"
)

var DB *gorm.DB

func Init() {
	var err error
	DB, err = gorm.Open(sqlite.Open("speedtest.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	DB.AutoMigrate(&model.SpeedTestResult{}, &model.MonitorTask{})
	log.Println("Database initialized successfully")
}
