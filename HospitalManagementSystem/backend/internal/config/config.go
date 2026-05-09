package config

import (
	"log"
	"path/filepath"
	"runtime"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Port int
	Mode string
}

type DatabaseConfig struct {
	Host         string
	Port         int
	User         string
	Password     string
	DBName       string
	Charset      string
	MaxIdleConns int
	MaxOpenConns int
}

type JWTConfig struct {
	Secret string
	Expire int
}

var AppConfig *Config

func LoadConfig() *Config {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")

	_, filename, _, _ := runtime.Caller(0)
	configPath := filepath.Join(filepath.Dir(filename), "../..")
	viper.AddConfigPath(configPath)

	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("读取配置文件失败: %v", err)
	}

	AppConfig = &Config{}
	if err := viper.Unmarshal(AppConfig); err != nil {
		log.Fatalf("解析配置文件失败: %v", err)
	}

	return AppConfig
}
