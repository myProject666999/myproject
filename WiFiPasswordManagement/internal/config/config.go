package config

import (
	"os"
)

type Config struct {
	Port       string
	DBPath     string
	MasterKey  string
	StaticDir  string
}

func Load() *Config {
	return &Config{
		Port:      getEnv("PORT", "8080"),
		DBPath:    getEnv("DB_PATH", "./wifipwd.db"),
		MasterKey: getEnv("MASTER_KEY", "change-me-32bytes-0123456789ab"),
		StaticDir: getEnv("STATIC_DIR", "../web/dist"),
	}
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
