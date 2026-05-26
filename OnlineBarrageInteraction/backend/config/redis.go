package config

import (
	"context"
	"fmt"
	"log"

	"github.com/go-redis/redis/v8"
)

var Ctx = context.Background()

func NewRedisClient() *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", AppConfig.Redis.Host, AppConfig.Redis.Port),
		Password: AppConfig.Redis.Password,
		DB:       AppConfig.Redis.DB,
	})

	if err := rdb.Ping(Ctx).Err(); err != nil {
		log.Printf("Warning: Redis connection failed: %v", err)
	} else {
		log.Println("Redis connected successfully")
	}

	return rdb
}
