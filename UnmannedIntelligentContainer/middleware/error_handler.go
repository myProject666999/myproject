package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"unmanned-container/utils"
)

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Panic recovered: %v", err)
				utils.ErrorWithStatus(c, http.StatusInternalServerError, 500, "Internal Server Error")
				c.Abort()
			}
		}()
		c.Next()
	}
}
