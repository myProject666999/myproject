package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
)

var Client *redis.Client

func InitRedis(host, port, password string, db int) {
	Client = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", host, port),
		Password: password,
		DB:       db,
	})
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_, err := Client.Ping(ctx).Result()
	if err != nil {
		fmt.Printf("Redis connection warning: %v, Redis cache disabled\n", err)
		Client = nil
	} else {
		fmt.Println("Redis connected successfully")
	}
}

func GetClient() *redis.Client {
	return Client
}

func Close() {
	if Client != nil {
		Client.Close()
	}
}
