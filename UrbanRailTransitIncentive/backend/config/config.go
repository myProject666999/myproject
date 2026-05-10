package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     int
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	JWTExpire  int
	Port       string
	AMAPKey    string
}

var AppConfig Config

func LoadConfig() error {
	if err := godotenv.Load(); err != nil {
		return err
	}

	dbPort, _ := strconv.Atoi(getEnv("DB_PORT", "3306"))
	jwtExpire, _ := strconv.Atoi(getEnv("JWT_EXPIRE_HOURS", "24"))

	AppConfig = Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     dbPort,
		DBUser:     getEnv("DB_USER", "root"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "urbanrail"),
		JWTSecret:  getEnv("JWT_SECRET", "default_secret"),
		JWTExpire:  jwtExpire,
		Port:       getEnv("PORT", "8080"),
		AMAPKey:    getEnv("AMAP_KEY", ""),
	}

	return nil
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
