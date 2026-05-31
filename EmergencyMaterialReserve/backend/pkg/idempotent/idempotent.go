package idempotent

import (
	"context"
	"fmt"
	"time"

	"emergency-material/internal/database"
)

const (
	idempotentKeyPrefix = "idempotent:"
	defaultExpireTime   = 24 * time.Hour
)

func Check(ctx context.Context, key string) (bool, error) {
	if key == "" {
		return false, nil
	}

	redisKey := idempotentKeyPrefix + key

	result, err := database.RedisClient.SetNX(ctx, redisKey, "1", defaultExpireTime).Result()
	if err != nil {
		return false, fmt.Errorf("redis setnx error: %w", err)
	}

	return !result, nil
}

func Remove(ctx context.Context, key string) error {
	if key == "" {
		return nil
	}

	redisKey := idempotentKeyPrefix + key
	return database.RedisClient.Del(ctx, redisKey).Err()
}

func MarkSuccess(ctx context.Context, key string) error {
	if key == "" {
		return nil
	}

	redisKey := idempotentKeyPrefix + key
	return database.RedisClient.Set(ctx, redisKey, "success", defaultExpireTime).Err()
}

func MarkFailed(ctx context.Context, key string) error {
	if key == "" {
		return nil
	}

	redisKey := idempotentKeyPrefix + key
	return database.RedisClient.Del(ctx, redisKey).Err()
}

func GenerateKey(parts ...interface{}) string {
	key := ""
	for i, part := range parts {
		if i > 0 {
			key += ":"
		}
		key += fmt.Sprintf("%v", part)
	}
	return key
}
