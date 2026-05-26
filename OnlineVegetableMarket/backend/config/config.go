package config

import (
	"fmt"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/redis/go-redis/v9"
)

type Config struct {
	DB    *gorm.DB
	Redis *redis.Client
}

var Cfg Config

func Init() {
	InitDB()
	InitRedis()
}

func InitDB() {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		getEnv("DB_USER", "root"),
		getEnv("DB_PASS", "123456"),
		getEnv("DB_HOST", "127.0.0.1"),
		getEnv("DB_PORT", "3306"),
		getEnv("DB_NAME", "vegetable_market"),
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(fmt.Sprintf("Failed to connect to database: %v", err))
	}

	sqlDB, _ := db.DB()
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	Cfg.DB = db
	fmt.Println("Database connected successfully")
}

func InitRedis() {
	rdb := redis.NewClient(&redis.Options{
		Addr:     getEnv("REDIS_ADDR", "127.0.0.1:6379"),
		Password: getEnv("REDIS_PASS", ""),
		DB:       0,
	})

	Cfg.Redis = rdb
	fmt.Println("Redis connected successfully")
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
