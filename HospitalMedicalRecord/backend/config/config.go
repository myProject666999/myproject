package config

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Upload   UploadConfig
}

type ServerConfig struct {
	Port string
	Mode string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	Charset  string
}

type JWTConfig struct {
	Secret      string
	ExpireHours int
}

type UploadConfig struct {
	Dir         string
	MaxSize     int64
}

var AppConfig *Config

func InitConfig() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using default values")
	}

	viper.AutomaticEnv()

	AppConfig = &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Mode: getEnv("SERVER_MODE", "debug"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "127.0.0.1"),
			Port:     getEnv("DB_PORT", "3306"),
			User:     getEnv("DB_USER", "root"),
			Password: getEnv("DB_PASSWORD", "root"),
			Name:     getEnv("DB_NAME", "hospital_medical_record"),
			Charset:  getEnv("DB_CHARSET", "utf8mb4"),
		},
		JWT: JWTConfig{
			Secret:      getEnv("JWT_SECRET", "hospital-medical-record-secret-key"),
			ExpireHours: getEnvInt("JWT_EXPIRE_HOURS", 72),
		},
		Upload: UploadConfig{
			Dir:     getEnv("UPLOAD_DIR", "./uploads"),
			MaxSize: getEnvInt64("MAX_UPLOAD_SIZE", 10*1024*1024),
		},
	}
}

func (c *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=True&loc=Local",
		c.User, c.Password, c.Host, c.Port, c.Name, c.Charset)
}

func getEnv(key, defaultValue string) string {
	value := viper.GetString(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func getEnvInt(key string, defaultValue int) int {
	value := viper.GetInt(key)
	if value == 0 {
		return defaultValue
	}
	return value
}

func getEnvInt64(key string, defaultValue int64) int64 {
	value := viper.GetInt64(key)
	if value == 0 {
		return defaultValue
	}
	return value
}
