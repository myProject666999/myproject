package middleware

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	red "github.com/redis/go-redis/v9"

	"online-voting/internal/redis"
)

func RateLimit(keyPrefix string, max int, window time.Duration) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if redis.Client == nil {
			return c.Next()
		}
		ip := c.IP()
		key := fmt.Sprintf("rate:%s:%s", keyPrefix, ip)

		count, err := redis.Client.Incr(redis.Ctx, key).Result()
		if err != nil {
			return c.Next()
		}
		if count == 1 {
			redis.Client.Expire(redis.Ctx, key, window)
		}
		if count > int64(max) {
			return c.Status(429).JSON(fiber.Map{"code": 429, "message": "请求过于频繁，请稍后再试"})
		}
		return c.Next()
	}
}

func PerActivityLimit(activityIDKey string, maxPerIP int, window time.Duration) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if redis.Client == nil {
			return c.Next()
		}
		ip := c.IP()
		actID := c.Params(activityIDKey)
		key := fmt.Sprintf("vote_limit:%s:%s", actID, ip)

		val, err := redis.Client.Get(redis.Ctx, key).Result()
		if err == red.Nil {
			redis.Client.Set(redis.Ctx, key, 1, window)
			return c.Next()
		}
		if err != nil {
			return c.Next()
		}
		count := 0
		fmt.Sscanf(val, "%d", &count)
		if count >= maxPerIP {
			return c.Status(429).JSON(fiber.Map{"code": 429, "message": "该活动已达投票上限"})
		}
		redis.Client.Incr(redis.Ctx, key)
		return c.Next()
	}
}
