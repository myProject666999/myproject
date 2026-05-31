package repository

import (
	"context"
	"load-testing/config"
	"load-testing/pkg/logger"

	"github.com/go-redis/redis/v8"
)

var RedisClient *redis.Client
var Ctx = context.Background()

func InitRedis() error {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     config.AppConfig.Redis.Addr(),
		Password: config.AppConfig.Redis.Password,
		DB:       config.AppConfig.Redis.DB,
	})

	_, err := RedisClient.Ping(Ctx).Result()
	if err != nil {
		return err
	}

	logger.Info("Redis connection established")
	return nil
}

func GetRedis() *redis.Client {
	return RedisClient
}
