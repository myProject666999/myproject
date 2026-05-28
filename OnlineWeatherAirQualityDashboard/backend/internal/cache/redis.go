package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"air-quality-dashboard/internal/config"

	"github.com/go-redis/redis/v8"
)

type RedisCache struct {
	client *redis.Client
	ctx    context.Context
}

var Cache *RedisCache

func New(cfg *config.Config) *RedisCache {
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr(),
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})

	ctx := context.Background()

	if err := rdb.Ping(ctx).Err(); err != nil {
		fmt.Printf("Warning: Failed to connect to Redis: %v\n", err)
		fmt.Println("Running without Redis cache...")
		return nil
	}

	Cache = &RedisCache{
		client: rdb,
		ctx:    ctx,
	}

	fmt.Println("Redis connected successfully")
	return Cache
}

func (r *RedisCache) Set(key string, value interface{}, expiration time.Duration) error {
	jsonValue, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return r.client.Set(r.ctx, key, jsonValue, expiration).Err()
}

func (r *RedisCache) Get(key string, dest interface{}) error {
	val, err := r.client.Get(r.ctx, key).Result()
	if err != nil {
		return err
	}
	return json.Unmarshal([]byte(val), dest)
}

func (r *RedisCache) Delete(key string) error {
	return r.client.Del(r.ctx, key).Err()
}

func (r *RedisCache) Close() error {
	return r.client.Close()
}

func (r *RedisCache) Client() *redis.Client {
	return r.client
}

func (r *RedisCache) Ctx() context.Context {
	return r.ctx
}
