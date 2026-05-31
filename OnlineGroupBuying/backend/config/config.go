package config

import "os"

type Config struct {
	MySQLDSN      string
	RedisAddr     string
	RedisPassword string
	RedisDB       int
	ServerPort    string
	JWTSecret     string
}

func Load() *Config {
	return &Config{
		MySQLDSN:      getEnv("MYSQL_DSN", "root:123456@tcp(127.0.0.1:3306)/group_buying?charset=utf8mb4&parseTime=True&loc=Local"),
		RedisAddr:     getEnv("REDIS_ADDR", "127.0.0.1:6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       0,
		ServerPort:    getEnv("SERVER_PORT", ":8080"),
		JWTSecret:     getEnv("JWT_SECRET", "group-buying-secret-key-2024"),
	}
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
