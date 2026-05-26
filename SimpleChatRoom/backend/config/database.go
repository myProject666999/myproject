package config

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB() {
	dsn := "root:123456@tcp(127.0.0.1:3306)/simple_chat_room?charset=utf8mb4&parseTime=True&loc=Local"

	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	DB.SetMaxOpenConns(100)
	DB.SetMaxIdleConns(20)

	if err = DB.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("Database connection established successfully")
}

func CloseDB() {
	if DB != nil {
		DB.Close()
		fmt.Println("Database connection closed")
	}
}
