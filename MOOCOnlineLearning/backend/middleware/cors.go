package middleware

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:8080",
			"http://localhost:8081",
			"http://localhost:3000",
			"http://localhost:5173",
			"http://127.0.0.1:8080",
			"http://127.0.0.1:8081",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:5173",
		},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
			"X-Requested-With",
			"X-Token",
			"X-CSRF-Token",
		},
		ExposeHeaders: []string{
			"Content-Length",
			"Content-Disposition",
			"X-Total-Count",
		},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})
}
