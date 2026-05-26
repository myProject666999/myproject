package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost        string
	DBPort        string
	DBUser        string
	DBPassword    string
	DBName        string
	ServerPort    string
	PDFOutputDir  string
	ChromePath    string
}

var AppConfig *Config

func LoadConfig() error {
	if err := godotenv.Load(); err != nil {
	}

	AppConfig = &Config{
		DBHost:       getEnv("DB_HOST", "127.0.0.1"),
		DBPort:       getEnv("DB_PORT", "3306"),
		DBUser:       getEnv("DB_USER", "root"),
		DBPassword:   getEnv("DB_PASSWORD", "123456"),
		DBName:       getEnv("DB_NAME", "web2pdf"),
		ServerPort:   getEnv("SERVER_PORT", "8080"),
		PDFOutputDir: getEnv("PDF_OUTPUT_DIR", "./output"),
		ChromePath:   getEnv("CHROME_PATH", ""),
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
