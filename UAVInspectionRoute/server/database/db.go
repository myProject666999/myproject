package database

import (
	"fmt"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"uav-inspection-server/config"
)

var DB *gorm.DB
var RDB *redis.Client

func InitMySQL(cfg config.MySQLConfig) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.DBName)
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect mysql: %v", err)
	}
	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("failed to get sql db: %v", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
	sqlDB.SetConnMaxIdleTime(10 * time.Minute)
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			if err := sqlDB.Ping(); err != nil {
				log.Printf("mysql connection lost, reconnecting...")
				newDB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
				if err == nil {
					DB = newDB
					log.Println("mysql reconnected")
				}
			}
		}
	}()
	log.Println("mysql connected")
}

func InitRedis(cfg config.RedisConfig) {
	RDB = redis.NewClient(&redis.Options{
		Addr:     cfg.Addr,
		Password: cfg.Password,
		DB:       0,
	})
	if err := RDB.Ping(RDB.Context()).Err(); err != nil {
		log.Fatalf("failed to connect redis: %v", err)
	}
	log.Println("redis connected")
}
