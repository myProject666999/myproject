package config

import (
	"os"
	"strconv"
)

type Config struct {
	ServerPort  string
	MySQLDSN    string
	RedisAddr   string
	RedisPass   string
	RedisDB     int
	QuizTime    int
	ComboBonus  int
}

func LoadConfig() *Config {
	return &Config{
		ServerPort: getEnv("SERVER_PORT", ":8080"),
		MySQLDSN:   getEnv("MYSQL_DSN", "root:123456@tcp(127.0.0.1:3306)/online_quiz_game?charset=utf8mb4&parseTime=True&loc=Local"),
		RedisAddr:  getEnv("REDIS_ADDR", "127.0.0.1:6379"),
		RedisPass:  getEnv("REDIS_PASS", ""),
		RedisDB:    getEnvAsInt("REDIS_DB", 0),
		QuizTime:   getEnvAsInt("QUIZ_TIME", 30),
		ComboBonus: getEnvAsInt("COMBO_BONUS", 50),
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}
	return value
}
