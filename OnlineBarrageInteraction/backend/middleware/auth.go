package middleware

import (
	"net/http"

	"barrage_interaction/models"

	"github.com/gin-gonic/gin"
)

func AdminAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		var admin models.AdminUser
		if err := models.DB.Where("id = ?", authHeader).First(&admin).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid admin credentials"})
			c.Abort()
			return
		}

		c.Set("admin_id", admin.ID)
		c.Next()
	}
}
