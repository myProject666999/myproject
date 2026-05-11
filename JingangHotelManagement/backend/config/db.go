package config

import (
	"fmt"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	rootDSN := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		"root",
		"123456",
		"localhost",
		"3306",
	)

	rootDB, err := gorm.Open(mysql.Open(rootDSN), &gorm.Config{})
	if err != nil {
		panic("failed to connect to MySQL server")
	}

	rootDB.Exec("CREATE DATABASE IF NOT EXISTS jingang_hotel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		"root",
		"123456",
		"localhost",
		"3306",
		"jingang_hotel",
	)

	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	sqlDB, _ := DB.DB()
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
}
