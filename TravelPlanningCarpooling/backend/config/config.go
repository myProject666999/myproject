package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server ServerConfig `yaml:"server"`
	MySQL  MySQLConfig  `yaml:"mysql"`
	Redis  RedisConfig  `yaml:"redis"`
	JWT    JWTConfig    `yaml:"jwt"`
}

type ServerConfig struct {
	Port string `yaml:"port"`
	Mode string `yaml:"mode"`
}

type MySQLConfig struct {
	Host         string `yaml:"host"`
	Port         int    `yaml:"port"`
	User         string `yaml:"user"`
	Password     string `yaml:"password"`
	Database     string `yaml:"database"`
	Charset      string `yaml:"charset"`
	ParseTime    bool   `yaml:"parseTime"`
	Loc          string `yaml:"loc"`
	MaxIdleConns int    `yaml:"maxIdleConns"`
	MaxOpenConns int    `yaml:"maxOpenConns"`
}

func (m MySQLConfig) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=%t&loc=%s",
		m.User, m.Password, m.Host, m.Port, m.Database, m.Charset, m.ParseTime, m.Loc)
}

type RedisConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Password string `yaml:"password"`
	DB       int    `yaml:"db"`
	PoolSize int    `yaml:"poolSize"`
}

func (r RedisConfig) Addr() string {
	return fmt.Sprintf("%s:%d", r.Host, r.Port)
}

type JWTConfig struct {
	Secret      string `yaml:"secret"`
	ExpireHours int    `yaml:"expireHours"`
}

var AppConfig *Config

func Load(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	AppConfig = &Config{}
	return yaml.Unmarshal(data, AppConfig)
}
