package config

import (
	"fmt"
	"log"

	"github.com/glebarez/sqlite"
	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	JWT      JWTConfig      `mapstructure:"jwt"`
}

type ServerConfig struct {
	Port int    `mapstructure:"port"`
	Mode string `mapstructure:"mode"`
}

type DatabaseConfig struct {
	Type       string `mapstructure:"type"`
	SqlitePath string `mapstructure:"sqlite_path"`
	Host       string `mapstructure:"host"`
	Port       int    `mapstructure:"port"`
	Username   string `mapstructure:"username"`
	Password   string `mapstructure:"password"`
	DBName     string `mapstructure:"dbname"`
	Charset    string `mapstructure:"charset"`
}

type JWTConfig struct {
	Secret     string `mapstructure:"secret"`
	ExpireTime int    `mapstructure:"expire_time"`
}

var AppConfig Config
var DB *gorm.DB

func InitConfig() {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./config")
	viper.AddConfigPath(".")

	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("读取配置文件失败:", err)
	}

	if err := viper.Unmarshal(&AppConfig); err != nil {
		log.Fatal("解析配置文件失败:", err)
	}
}

func InitDB() {
	var err error
	cfg := AppConfig.Database

	if cfg.Type == "sqlite" {
		dbPath := cfg.SqlitePath
		if dbPath == "" {
			dbPath = "./data.db"
		}
		DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
		if err != nil {
			log.Fatal("连接SQLite数据库失败:", err)
		}
		log.Println("已连接到SQLite数据库:", dbPath)
	} else {
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=True&loc=Local",
			cfg.Username, cfg.Password, cfg.Host, cfg.Port, cfg.DBName, cfg.Charset)
		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Fatal("连接MySQL数据库失败:", err)
		}
		log.Println("已连接到MySQL数据库")
	}
}
