package middleware

import (
	"net/http"
	"sync"
	"time"

	"barrage_interaction/config"

	"github.com/gin-gonic/gin"
)

type RateLimiter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex
}

type visitor struct {
	count    int
	lastSeen time.Time
}

var limiter = &RateLimiter{
	visitors: make(map[string]*visitor),
}

func (l *RateLimiter) Allow(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	v, exists := l.visitors[key]
	duration := time.Duration(config.AppConfig.Limiter.Duration) * time.Second

	if !exists || time.Since(v.lastSeen) > duration {
		l.visitors[key] = &visitor{count: 1, lastSeen: time.Now()}
		return true
	}

	if v.count >= config.AppConfig.Limiter.MaxRequests {
		return false
	}

	v.count++
	return true
}

func RateLimiterMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !limiter.Allow(ip) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests, please try again later",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
