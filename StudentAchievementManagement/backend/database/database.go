package database

import (
	"log"
	"os"
	"student-management/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dbPath := "student.db"
	
	if _, err := os.Stat(dbPath); err == nil {
		log.Println("Removing existing database to recreate...")
		os.Remove(dbPath)
	}

	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = DB.AutoMigrate(&models.Student{}, &models.Course{}, &models.Grade{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database connected and migrated successfully")
}
