package utils

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"vehicle-parking/backend/config"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func InitRedis(cfg config.RedisConfig) error {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     cfg.Host + ":" + cfg.Port,
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		return fmt.Errorf("Redis连接失败: %w", err)
	}

	return nil
}

func CloseRedis() {
	if RedisClient != nil {
		RedisClient.Close()
	}
}

type SpotCache struct {
	SpotID         uint   `json:"spot_id"`
	SpotNumber     string `json:"spot_number"`
	Status         int    `json:"status"`
	PlateNumber    string `json:"plate_number,omitempty"`
	VehicleID      uint   `json:"vehicle_id,omitempty"`
	EntryTime      string `json:"entry_time,omitempty"`
}

func GetSpotStatusKey(spotID uint) string {
	return fmt.Sprintf("spot:status:%d", spotID)
}

func GetVehicleSpotKey(plateNumber string) string {
	return fmt.Sprintf("vehicle:spot:%s", plateNumber)
}

func CacheSpotStatus(ctx context.Context, spot *SpotCache) error {
	key := GetSpotStatusKey(spot.SpotID)
	data, err := json.Marshal(spot)
	if err != nil {
		return err
	}
	return RedisClient.Set(ctx, key, data, 24*time.Hour).Err()
}

func GetSpotStatus(ctx context.Context, spotID uint) (*SpotCache, error) {
	key := GetSpotStatusKey(spotID)
	data, err := RedisClient.Get(ctx, key).Bytes()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	var spot SpotCache
	err = json.Unmarshal(data, &spot)
	return &spot, err
}

func DeleteSpotStatus(ctx context.Context, spotID uint) error {
	key := GetSpotStatusKey(spotID)
	return RedisClient.Del(ctx, key).Err()
}

func SetVehicleSpot(ctx context.Context, plateNumber string, spotID uint) error {
	key := GetVehicleSpotKey(plateNumber)
	return RedisClient.Set(ctx, key, spotID, 24*time.Hour).Err()
}

func GetVehicleSpot(ctx context.Context, plateNumber string) (uint, error) {
	key := GetVehicleSpotKey(plateNumber)
	val, err := RedisClient.Get(ctx, key).Uint64()
	if err == redis.Nil {
		return 0, nil
	}
	return uint(val), err
}

func DeleteVehicleSpot(ctx context.Context, plateNumber string) error {
	key := GetVehicleSpotKey(plateNumber)
	return RedisClient.Del(ctx, key).Err()
}

func GetAllSpotStatus(ctx context.Context) (map[string]*SpotCache, error) {
	pattern := "spot:status:*"
	var cursor uint64
	result := make(map[string]*SpotCache)

	for {
		keys, nextCursor, err := RedisClient.Scan(ctx, cursor, pattern, 100).Result()
		if err != nil {
			return nil, err
		}

		for _, key := range keys {
			data, err := RedisClient.Get(ctx, key).Bytes()
			if err != nil {
				continue
			}
			var spot SpotCache
			if json.Unmarshal(data, &spot) == nil {
				result[key] = &spot
			}
		}

		cursor = nextCursor
		if cursor == 0 {
			break
		}
	}

	return result, nil
}
