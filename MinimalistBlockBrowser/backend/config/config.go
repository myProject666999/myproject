package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Web3     Web3Config
	Cache    CacheConfig
}

type ServerConfig struct {
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
}

type Web3Config struct {
	RPCEndpoint string
	APIKey      string
	NetworkName string
}

type CacheConfig struct {
	BlockTTL      time.Duration
	TransactionTTL time.Duration
	AddressTTL    time.Duration
	GasTTL        time.Duration
}

func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port:         getEnv("SERVER_PORT", "8080"),
			ReadTimeout:  time.Duration(getEnvInt("SERVER_READ_TIMEOUT", 10)) * time.Second,
			WriteTimeout: time.Duration(getEnvInt("SERVER_WRITE_TIMEOUT", 10)) * time.Second,
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "127.0.0.1"),
			Port:     getEnv("DB_PORT", "3306"),
			User:     getEnv("DB_USER", "root"),
			Password: getEnv("DB_PASSWORD", "123456"),
			Name:     getEnv("DB_NAME", "block_browser"),
		},
		Web3: Web3Config{
			RPCEndpoint: getEnv("WEB3_RPC_ENDPOINT", "https://mainnet.infura.io/v3/"),
			APIKey:      getEnv("WEB3_API_KEY", ""),
			NetworkName: getEnv("WEB3_NETWORK_NAME", "Ethereum Mainnet"),
		},
		Cache: CacheConfig{
			BlockTTL:      time.Duration(getEnvInt("CACHE_BLOCK_TTL", 300)) * time.Second,
			TransactionTTL: time.Duration(getEnvInt("CACHE_TX_TTL", 3600)) * time.Second,
			AddressTTL:    time.Duration(getEnvInt("CACHE_ADDRESS_TTL", 60)) * time.Second,
			GasTTL:        time.Duration(getEnvInt("CACHE_GAS_TTL", 10)) * time.Second,
		},
	}
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if val, ok := os.LookupEnv(key); ok {
		if i, err := strconv.Atoi(val); err == nil {
			return i
		}
	}
	return fallback
}