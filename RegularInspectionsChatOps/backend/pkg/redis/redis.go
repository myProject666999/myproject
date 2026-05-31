package redis

import (
	"context"
	"inspection-chatops/configs"
	"time"

	"github.com/go-redis/redis/v8"
)

var Client *redis.Client

func Init() error {
	cfg := configs.AppConfig.Redis

	Client = redis.NewClient(&redis.Options{
		Addr:     cfg.Addr(),
		Password: cfg.Password,
		DB:       cfg.DB,
		PoolSize: cfg.PoolSize,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := Client.Ping(ctx).Result()
	return err
}

func GetClient() *redis.Client {
	return Client
}

type DistributedLock struct {
	key        string
	expiration time.Duration
}

func NewDistributedLock(key string, expiration time.Duration) *DistributedLock {
	return &DistributedLock{
		key:        "lock:" + key,
		expiration: expiration,
	}
}

func (l *DistributedLock) TryLock(ctx context.Context, value string) (bool, error) {
	return Client.SetNX(ctx, l.key, value, l.expiration).Result()
}

func (l *DistributedLock) Unlock(ctx context.Context) error {
	return Client.Del(ctx, l.key).Err()
}

func (l *DistributedLock) Lock(ctx context.Context, value string, retryInterval time.Duration) error {
	for {
		ok, err := l.TryLock(ctx, value)
		if err != nil {
			return err
		}
		if ok {
			return nil
		}
		time.Sleep(retryInterval)
	}
}
