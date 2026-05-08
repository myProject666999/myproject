package middleware

import (
	"github.com/gin-gonic/gin"
)

func EncodingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "application/json; charset=utf-8")
		c.Next()
	}
}
