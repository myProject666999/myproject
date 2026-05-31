package database

import (
	"log"
	"online-borrowing-returning/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	db, err := gorm.Open(sqlite.Open("borrowing.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	db.AutoMigrate(&models.Item{}, &models.Borrow{}, &models.Reservation{})

	DB = db
	log.Println("Database connected and migrated successfully")
}
