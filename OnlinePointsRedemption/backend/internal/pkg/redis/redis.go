package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/onlinemall/backend/internal/config"
)

var RDB *redis.Client

func Init(cfg *config.RedisConfig) error {
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.Addr(),
		Password: cfg.Password,
		DB:       cfg.DB,
		PoolSize: cfg.PoolSize,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("connect redis failed: %w", err)
	}

	RDB = rdb
	return nil
}

func Close() {
	if RDB != nil {
		RDB.Close()
	}
}

func Key(parts ...string) string {
	key := "points_mall"
	for _, p := range parts {
		key += ":" + p
	}
	return key
}

func IsConnected() bool {
	return RDB != nil
}
