package middleware

import (
	"net/http"

	"emergency-material/pkg/idempotent"
	"emergency-material/pkg/response"

	"github.com/gin-gonic/gin"
)

func Idempotent() gin.HandlerFunc {
	return func(c *gin.Context) {
		idempotentKey := c.Request.Header.Get("Idempotent-Key")
		if idempotentKey == "" {
			c.Next()
			return
		}

		ok, err := idempotent.Check(c.Request.Context(), idempotentKey)
		if err != nil {
			response.ErrorWithCode(c, http.StatusInternalServerError, "幂等性检查失败")
			c.Abort()
			return
		}

		if !ok {
			response.ErrorWithCode(c, http.StatusConflict, "重复请求")
			c.Abort()
			return
		}

		c.Next()
	}
}
