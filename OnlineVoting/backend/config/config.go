package config

import (
	"os"
)

type Config struct {
	AppPort   string
	AppSecret string

	DBHost string
	DBPort string
	DBUser string
	DBPass string
	DBName string

	RedisAddr string
	RedisPass string
	RedisDB   int
}

func Load() *Config {
	return &Config{
		AppPort:   getEnv("APP_PORT", "8080"),
		AppSecret: getEnv("APP_SECRET", "online-voting-secret-key"),
		DBHost:    getEnv("DB_HOST", "127.0.0.1"),
		DBPort:    getEnv("DB_PORT", "3306"),
		DBUser:    getEnv("DB_USER", "root"),
		DBPass:    getEnv("DB_PASS", "123456"),
		DBName:    getEnv("DB_NAME", "online_voting"),
		RedisAddr: getEnv("REDIS_ADDR", "127.0.0.1:6379"),
		RedisPass: getEnv("REDIS_PASS", ""),
		RedisDB:   0,
	}
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
