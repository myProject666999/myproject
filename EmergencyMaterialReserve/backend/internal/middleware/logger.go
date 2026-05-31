package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method
		clientIP := c.ClientIP()

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()
		bodySize := c.Writer.Size()

		log.Printf("[%s] %s %s - %d - %v - %s - %d bytes",
			method,
			path,
			clientIP,
			statusCode,
			latency,
			c.Request.UserAgent(),
			bodySize,
		)

		if len(c.Errors) > 0 {
			log.Printf("Request errors: %v", c.Errors.String())
		}
	}
}
