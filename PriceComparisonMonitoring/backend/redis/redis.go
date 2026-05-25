package redis

import (
	"context"
	"log"
	"price-monitor/config"

	"github.com/go-redis/redis/v8"
)

var RDB *redis.Client

var Ctx = context.Background()

func InitRedis(cfg *config.RedisConfig) (*redis.Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.Addr(),
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	_, err := rdb.Ping(Ctx).Result()
	if err != nil {
		return nil, err
	}

	RDB = rdb
	log.Println("Redis connected successfully")
	return rdb, nil
}

func CloseRedis() {
	if RDB != nil {
		RDB.Close()
	}
}
