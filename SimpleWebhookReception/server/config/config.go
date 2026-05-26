package config

import "time"

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	RateLimit RateLimitConfig
}

type ServerConfig struct {
	Port string
	Mode string
}

type DatabaseConfig struct {
	Path string
}

type RateLimitConfig struct {
	PerEndpoint int
	Window      time.Duration
}

var AppConfig = Config{
	Server: ServerConfig{
		Port: ":8080",
		Mode: "debug",
	},
	Database: DatabaseConfig{
		Path: "./webhook.db",
	},
	RateLimit: RateLimitConfig{
		PerEndpoint: 60,
		Window:      time.Minute,
	},
}

func (c *Config) GetAddr() string {
	return c.Server.Port
}
