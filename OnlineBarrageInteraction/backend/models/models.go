package models

import (
	"fmt"
	"log"
	"time"

	"barrage_interaction/config"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

var DB *gorm.DB

type User struct {
	ID        uint      `json:"id" gorm:"primary_key"`
	Nickname  string    `json:"nickname" gorm:"not null;size:50"`
	Avatar    string    `json:"avatar" gorm:"size:255"`
	IP        string    `json:"ip" gorm:"size:50"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Message struct {
	ID          uint      `json:"id" gorm:"primary_key"`
	UserID      uint      `json:"user_id" gorm:"not null;index"`
	Content     string    `json:"content" gorm:"type:text;not null"`
	Status      int       `json:"status" gorm:"default:0;index"`
	IsSensitive int       `json:"is_sensitive" gorm:"default:0"`
	Likes       int       `json:"likes" gorm:"default:0"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	User        User      `json:"user,omitempty" gorm:"foreignkey:UserID"`
}

type Like struct {
	ID        uint      `json:"id" gorm:"primary_key"`
	MessageID uint      `json:"message_id" gorm:"not null;index"`
	UserID    uint      `json:"user_id" gorm:"not null;index"`
	CreatedAt time.Time `json:"created_at"`
}

type Lottery struct {
	ID          uint      `json:"id" gorm:"primary_key"`
	ActivityName string   `json:"activity_name" gorm:"not null;size:100"`
	PrizeName   string    `json:"prize_name" gorm:"not null;size:100"`
	WinnerCount int       `json:"winner_count" gorm:"default:1"`
	Status      int       `json:"status" gorm:"default:0"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type LotteryWinner struct {
	ID         uint      `json:"id" gorm:"primary_key"`
	LotteryID  uint      `json:"lottery_id" gorm:"not null;index"`
	UserID     uint      `json:"user_id" gorm:"not null"`
	Nickname   string    `json:"nickname" gorm:"not null;size:50"`
	CreatedAt  time.Time `json:"created_at"`
}

type AdminUser struct {
	ID        uint      `json:"id" gorm:"primary_key"`
	Username  string    `json:"username" gorm:"unique;not null;size:50"`
	Password  string    `json:"-" gorm:"not null;size:255"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func InitDB() error {
	dbConfig := config.AppConfig.Database

	rootDSN := fmt.Sprintf("%s:%s@tcp(%s:%d)/?charset=%s&parseTime=True&loc=Local",
		dbConfig.Username,
		dbConfig.Password,
		dbConfig.Host,
		dbConfig.Port,
		dbConfig.Charset,
	)

	rootDB, err := gorm.Open("mysql", rootDSN)
	if err != nil {
		return fmt.Errorf("failed to connect to MySQL server: %v", err)
	}
	defer rootDB.Close()

	createDBQuery := fmt.Sprintf(
		"CREATE DATABASE IF NOT EXISTS %s DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
		dbConfig.DBName,
	)
	if err := rootDB.Exec(createDBQuery).Error; err != nil {
		return fmt.Errorf("failed to create database: %v", err)
	}
	log.Println("Database created or already exists")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=True&loc=Local",
		dbConfig.Username,
		dbConfig.Password,
		dbConfig.Host,
		dbConfig.Port,
		dbConfig.DBName,
		dbConfig.Charset,
	)

	DB, err = gorm.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	DB.DB().SetMaxIdleConns(10)
	DB.DB().SetMaxOpenConns(100)
	DB.DB().SetConnMaxLifetime(time.Hour)

	log.Println("Database connected successfully")
	return nil
}

func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}

func AutoMigrate() {
	DB.AutoMigrate(&User{}, &Message{}, &Like{}, &Lottery{}, &LotteryWinner{}, &AdminUser{})

	var count int
	DB.Model(&AdminUser{}).Count(&count)
	if count == 0 {
		DB.Create(&AdminUser{
			Username: "admin",
			Password: "admin123",
		})
		log.Println("Default admin user created")
	}

	log.Println("Database migration completed")
}
