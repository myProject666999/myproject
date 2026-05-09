package config

import (
	"os"
	"strconv"
)

type Config struct {
	ServerPort string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	SessionKey string

	EmailHost     string
	EmailPort     int
	EmailUser     string
	EmailPassword string
	EmailFrom     string

	AppURL string
}

func LoadConfig() *Config {
	emailPort, _ := strconv.Atoi(getEnv("EMAIL_PORT", "465"))

	return &Config{
		ServerPort: getEnv("SERVER_PORT", ":8080"),
		DBHost:     getEnv("DB_HOST", "127.0.0.1"),
		DBPort:     getEnv("DB_PORT", "3306"),
		DBUser:     getEnv("DB_USER", "root"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "english_learning"),
		JWTSecret:  getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		SessionKey: getEnv("SESSION_KEY", "session-key-change-in-production"),

		EmailHost:     getEnv("EMAIL_HOST", "smtp.qq.com"),
		EmailPort:     emailPort,
		EmailUser:     getEnv("EMAIL_USER", ""),
		EmailPassword: getEnv("EMAIL_PASSWORD", ""),
		EmailFrom:     getEnv("EMAIL_FROM", ""),

		AppURL: getEnv("APP_URL", "http://localhost:3000"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
