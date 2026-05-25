package config

import "os"

type Config struct {
	DBPath     string
	ServerPort string
}

func Load() *Config {
	return &Config{
		DBPath:     getEnv("DB_PATH", "./healthy_diet.db"),
		ServerPort: getEnv("SERVER_PORT", "8080"),
	}
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return defaultVal
}
