package config

import "os"

type Config struct {
	ServerPort string
	MySQLDSN   string
	RedisAddr  string
	RedisPass  string
	RedisDB    int
	UploadDir  string
	OutputDir  string
	FFmpegPath string
}

func Load() *Config {
	return &Config{
		ServerPort: getEnv("SERVER_PORT", "8080"),
		MySQLDSN:   getEnv("MYSQL_DSN", "root:123456@tcp(127.0.0.1:3306)/transcoding_db?charset=utf8mb4&parseTime=True&loc=Local"),
		RedisAddr:  getEnv("REDIS_ADDR", "127.0.0.1:6379"),
		RedisPass:  getEnv("REDIS_PASS", ""),
		RedisDB:    0,
		UploadDir:  getEnv("UPLOAD_DIR", "./uploads"),
		OutputDir:  getEnv("OUTPUT_DIR", "./outputs"),
		FFmpegPath: getEnv("FFMPEG_PATH", "ffmpeg"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
