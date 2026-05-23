package redis

import (
	"context"
	"log"
	"online-voting/config"

	"github.com/redis/go-redis/v9"
)

var Client *redis.Client
var Ctx = context.Background()

func Init(cfg *config.Config) {
	Client = redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPass,
		DB:       cfg.RedisDB,
	})
	if err := Client.Ping(Ctx).Err(); err != nil {
		log.Printf("warning: redis connection failed: %v", err)
	} else {
		log.Println("redis connected successfully")
	}
}
