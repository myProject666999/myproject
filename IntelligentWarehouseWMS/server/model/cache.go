package model

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/zeromicro/go-zero/core/stores/redis"
)

const (
	CacheKeyInventoryPrefix = "inventory:"
	CacheKeyLocationPrefix  = "location:"
	CacheKeyDashboard       = "dashboard:stats"
	CacheKeyProductPrefix   = "product:"
)

const (
	CacheExpireDefault = 5 * time.Minute
	CacheExpireShort   = 1 * time.Minute
	CacheExpireLong    = 30 * time.Minute
)

type CacheManager struct {
	redis *redis.Redis
}

func NewCacheManager(r *redis.Redis) *CacheManager {
	return &CacheManager{
		redis: r,
	}
}

func (c *CacheManager) GetInventoryKey(productId int64, locationId int64) string {
	return fmt.Sprintf("%s%d:%d", CacheKeyInventoryPrefix, productId, locationId)
}

func (c *CacheManager) Get(ctx context.Context, key string, val interface{}) error {
	data, err := c.redis.GetCtx(ctx, key)
	if err != nil {
		return err
	}
	if data == "" {
		return nil
	}
	return json.Unmarshal([]byte(data), val)
}

func (c *CacheManager) Set(ctx context.Context, key string, val interface{}, expire time.Duration) error {
	data, err := json.Marshal(val)
	if err != nil {
		return err
	}
	return c.redis.SetexCtx(ctx, key, string(data), int(expire.Seconds()))
}

func (c *CacheManager) Del(ctx context.Context, key string) error {
	_, err := c.redis.DelCtx(ctx, key)
	return err
}

func (c *CacheManager) DelPattern(ctx context.Context, pattern string) error {
	keys, err := c.redis.KeysCtx(ctx, pattern+"*")
	if err != nil {
		return err
	}
	if len(keys) == 0 {
		return nil
	}
	_, err = c.redis.DelCtx(ctx, keys...)
	return err
}

func (c *CacheManager) Incr(ctx context.Context, key string) (int64, error) {
	return c.redis.IncrCtx(ctx, key)
}

func (c *CacheManager) Decr(ctx context.Context, key string) (int64, error) {
	return c.redis.DecrCtx(ctx, key)
}

func (c *CacheManager) Exists(ctx context.Context, key string) (bool, error) {
	return c.redis.ExistsCtx(ctx, key)
}

type InventoryCache struct {
	Id           int64 `json:"id"`
	ProductId    int64 `json:"productId"`
	LocationId   int64 `json:"locationId"`
	Quantity     int64 `json:"quantity"`
	AvailableQty int64 `json:"availableQty"`
	LockedQty    int64 `json:"lockedQty"`
	Version      int64 `json:"version"`
}

type DashboardStats struct {
	TotalProducts   int64   `json:"totalProducts"`
	TotalInventory  int64   `json:"totalInventory"`
	TodayInbound    int64   `json:"todayInbound"`
	TodayOutbound   int64   `json:"todayOutbound"`
	InboundPending  int64   `json:"inboundPending"`
	OutboundPending int64   `json:"outboundPending"`
	TurnoverRate    float64 `json:"turnoverRate"`
}
