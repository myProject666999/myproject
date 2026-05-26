package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"strings"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	dsn := "root:123456@tcp(127.0.0.1:3306)/?charset=utf8mb4&parseTime=True&loc=Local"

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("Database connected successfully")

	sqlFile, err := ioutil.ReadFile("sql/init.sql")
	if err != nil {
		log.Fatalf("Failed to read SQL file: %v", err)
	}

	statements := strings.Split(string(sqlFile), ";")

	for _, stmt := range statements {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" || strings.HasPrefix(stmt, "--") {
			continue
		}

		if err := db.Exec(stmt).Error; err != nil {
			log.Printf("Warning: Failed to execute statement: %v", err)
		}
	}

	fmt.Println("Database initialized successfully!")
}
