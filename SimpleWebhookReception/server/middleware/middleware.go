package middleware

import (
	"net/http"
	"sync"
	"time"

	"simple-webhook-reception/config"
	"simple-webhook-reception/database"
	"simple-webhook-reception/models"

	"github.com/gin-gonic/gin"
)

type rateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitorData
}

type visitorData struct {
	count    int
	lastSeen time.Time
}

var limiter = &rateLimiter{
	visitors: make(map[string]*visitorData),
}

func (rl *rateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	v, exists := rl.visitors[key]
	if !exists || time.Since(v.lastSeen) > config.AppConfig.RateLimit.Window {
		rl.visitors[key] = &visitorData{
			count:    1,
			lastSeen: time.Now(),
		}
		return true
	}

	v.count++
	v.lastSeen = time.Now()

	return v.count <= config.AppConfig.RateLimit.PerEndpoint
}

func (rl *rateLimiter) cleanup() {
	for {
		time.Sleep(time.Minute)
		rl.mu.Lock()
		for key, v := range rl.visitors {
			if time.Since(v.lastSeen) > config.AppConfig.RateLimit.Window {
				delete(rl.visitors, key)
			}
		}
		rl.mu.Unlock()
	}
}

func init() {
	go limiter.cleanup()
}

func RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Param("token")
		if token == "" {
			c.Next()
			return
		}

		key := "endpoint:" + token
		if !limiter.Allow(key) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded",
			})
			return
		}

		c.Next()
	}
}

func EndpointIsolationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.Param("token")
		if token == "" {
			c.Next()
			return
		}

		var endpoint models.Endpoint
		result := database.DB.Where("token = ? AND active = ?", token, true).First(&endpoint)
		if result.Error != nil {
			c.AbortWithStatusJSON(http.StatusNotFound, gin.H{
				"error": "endpoint not found or inactive",
			})
			return
		}

		c.Set("endpoint", endpoint)
		c.Next()
	}
}
