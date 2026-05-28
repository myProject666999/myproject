package database

import (
	"battery-cabinet/config"
	"context"
	"time"

	"github.com/go-redis/redis/v8"
)

var RedisClient *redis.Client
var Ctx = context.Background()

func InitRedis() error {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     config.AppConfig.Redis.Addr(),
		Password: config.AppConfig.Redis.Password,
		DB:       config.AppConfig.Redis.Database,
		PoolSize: config.AppConfig.Redis.PoolSize,
	})

	ctx, cancel := context.WithTimeout(Ctx, 5*time.Second)
	defer cancel()

	_, err := RedisClient.Ping(ctx).Result()
	return err
}
