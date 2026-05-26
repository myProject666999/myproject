package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort     string
	AppEnv      string
	MySQLHost   string
	MySQLPort   string
	MySQLUser   string
	MySQLPass   string
	MySQLDB     string
	RedisHost   string
	RedisPort   string
	RedisPass   string
	RedisDB     int
	JWTSecret   string
	JWTExpire   int
}

var AppConfig *Config

func Load() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	redisDB, _ := strconv.Atoi(getEnv("REDIS_DB", "0"))
	jwtExpire, _ := strconv.Atoi(getEnv("JWT_EXPIRE_HOURS", "24"))

	AppConfig = &Config{
		AppPort:     getEnv("APP_PORT", "8080"),
		AppEnv:      getEnv("APP_ENV", "development"),
		MySQLHost:   getEnv("MYSQL_HOST", "127.0.0.1"),
		MySQLPort:   getEnv("MYSQL_PORT", "3306"),
		MySQLUser:   getEnv("MYSQL_USER", "root"),
		MySQLPass:   getEnv("MYSQL_PASSWORD", ""),
		MySQLDB:     getEnv("MYSQL_DATABASE", "online_repair_booking"),
		RedisHost:   getEnv("REDIS_HOST", "127.0.0.1"),
		RedisPort:   getEnv("REDIS_PORT", "6379"),
		RedisPass:   getEnv("REDIS_PASSWORD", ""),
		RedisDB:     redisDB,
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		JWTExpire:   jwtExpire,
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
