package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	JWTExpire  int
	UploadDir  string
	Port       string
}

func LoadConfig() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		return nil, fmt.Errorf("error loading .env file: %v", err)
	}

	jwtExpire, err := strconv.Atoi(getEnv("JWT_EXPIRE", "24"))
	if err != nil {
		jwtExpire = 24
	}

	return &Config{
		DBHost:     getEnv("DB_HOST", "127.0.0.1"),
		DBPort:     getEnv("DB_PORT", "3306"),
		DBUser:     getEnv("DB_USER", "root"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "campus_volunteer"),
		JWTSecret:  getEnv("JWT_SECRET", "default_secret"),
		JWTExpire:  jwtExpire,
		UploadDir:  getEnv("UPLOAD_DIR", "./uploads"),
		Port:       getEnv("PORT", "8080"),
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
