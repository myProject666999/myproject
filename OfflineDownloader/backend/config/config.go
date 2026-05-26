package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerHost string
	ServerPort int

	DBHost     string
	DBPort     int
	DBUser     string
	DBPassword string
	DBName     string

	Aria2RPCUrl    string
	Aria2RPCSecret string

	DownloadPath string
	MaxConcurrent int
}

var AppConfig *Config

func LoadConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	AppConfig = &Config{
		ServerHost: getEnv("SERVER_HOST", "0.0.0.0"),
		ServerPort: getEnvAsInt("SERVER_PORT", 8080),

		DBHost:     getEnv("DB_HOST", "127.0.0.1"),
		DBPort:     getEnvAsInt("DB_PORT", 3306),
		DBUser:     getEnv("DB_USER", "root"),
		DBPassword: getEnv("DB_PASSWORD", "123456"),
		DBName:     getEnv("DB_NAME", "offline_downloader"),

		Aria2RPCUrl:    getEnv("ARIA2_RPC_URL", "http://127.0.0.1:6800/jsonrpc"),
		Aria2RPCSecret: getEnv("ARIA2_RPC_SECRET", ""),

		DownloadPath:  getEnv("DOWNLOAD_PATH", "./downloads"),
		MaxConcurrent: getEnvAsInt("MAX_CONCURRENT", 5),
	}
}

func getEnv(key string, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
