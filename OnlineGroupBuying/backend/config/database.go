package config

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB
var RDB *redis.Client
var Ctx = context.Background()

func InitDB(dsn string) {
	var err error
	for i := 0; i < 10; i++ {
		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			break
		}
		log.Printf("数据库连接失败，第%d次重试: %v", i+1, err)
		time.Sleep(time.Second * 2)
	}
	if err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}
	log.Println("数据库连接成功")
}

func InitRedis(addr, password string, db int) {
	RDB = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})
	_, err := RDB.Ping(Ctx).Result()
	if err != nil {
		log.Printf("Redis连接失败: %v，将继续运行但Redis功能不可用", err)
		return
	}
	log.Println("Redis连接成功")
}
