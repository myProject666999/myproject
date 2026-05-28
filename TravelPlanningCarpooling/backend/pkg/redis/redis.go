package redis

import (
	"carpooling/config"
	"context"
	"log"

	"github.com/go-redis/redis/v8"
)

var Client *redis.Client
var Ctx = context.Background()

func Init() error {
	Client = redis.NewClient(&redis.Options{
		Addr:     config.AppConfig.Redis.Addr(),
		Password: config.AppConfig.Redis.Password,
		DB:       config.AppConfig.Redis.DB,
		PoolSize: config.AppConfig.Redis.PoolSize,
	})

	_, err := Client.Ping(Ctx).Result()
	if err != nil {
		return err
	}

	log.Println("Redis connected successfully")
	return nil
}

func GetClient() *redis.Client {
	return Client
}
