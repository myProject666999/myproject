package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port          string
	JWTSecret     string
	AdminUsername string
	AdminPassword string
	UploadDir     string
	MaxUploadSize int64
}

var App Config

func Init() error {
	App.Port = getEnv("PORT", "8080")
	App.JWTSecret = getEnv("JWT_SECRET", "default-secret-key")
	App.AdminUsername = getEnv("ADMIN_USERNAME", "admin")
	App.AdminPassword = getEnv("ADMIN_PASSWORD", "admin123")
	App.UploadDir = getEnv("UPLOAD_DIR", "./uploads")

	maxSize, err := strconv.ParseInt(getEnv("MAX_UPLOAD_SIZE", "10485760"), 10, 64)
	if err != nil {
		maxSize = 10 * 1024 * 1024
	}
	App.MaxUploadSize = maxSize

	return nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
