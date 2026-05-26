package middleware

import (
	"fmt"
	"net/http"
	"os"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

func RecoveryWithLog() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				stack := debug.Stack()
				fmt.Fprintf(os.Stderr, "[PANIC RECOVERY] %v\n%s\n", err, stack)
				c.JSON(http.StatusInternalServerError, gin.H{
					"code":    500,
					"message": fmt.Sprintf("服务器内部错误: %v", err),
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}
