package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	MySQL    MySQLConfig
	Redis    RedisConfig
	WebSocket WebSocketConfig
}

type ServerConfig struct {
	Host string
	Port int
}

type MySQLConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Database string
	Charset  string
	ParseTime bool
	Loc      string
}

type RedisConfig struct {
	Host     string
	Port     int
	Password string
	DB       int
}

type WebSocketConfig struct {
	ReadBufferSize  int
	WriteBufferSize int
	CheckOrigin     bool
}

var AppConfig *Config

func LoadConfig() error {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found, using environment variables: %v", err)
	}

	serverPort, _ := strconv.Atoi(getEnv("SERVER_PORT", "8080"))
	mysqlPort, _ := strconv.Atoi(getEnv("MYSQL_PORT", "3306"))
	mysqlParseTime, _ := strconv.ParseBool(getEnv("MYSQL_PARSE_TIME", "true"))
	redisPort, _ := strconv.Atoi(getEnv("REDIS_PORT", "6379"))
	redisDB, _ := strconv.Atoi(getEnv("REDIS_DB", "0"))
	wsReadBuffer, _ := strconv.Atoi(getEnv("WS_READ_BUFFER_SIZE", "1024"))
	wsWriteBuffer, _ := strconv.Atoi(getEnv("WS_WRITE_BUFFER_SIZE", "1024"))
	wsCheckOrigin, _ := strconv.ParseBool(getEnv("WS_CHECK_ORIGIN", "true"))

	AppConfig = &Config{
		Server: ServerConfig{
			Host: getEnv("SERVER_HOST", "0.0.0.0"),
			Port: serverPort,
		},
		MySQL: MySQLConfig{
			Host:      getEnv("MYSQL_HOST", "127.0.0.1"),
			Port:      mysqlPort,
			User:      getEnv("MYSQL_USER", "root"),
			Password:  getEnv("MYSQL_PASSWORD", "123456"),
			Database:  getEnv("MYSQL_DATABASE", "restaurant_queue"),
			Charset:   getEnv("MYSQL_CHARSET", "utf8mb4"),
			ParseTime: mysqlParseTime,
			Loc:       getEnv("MYSQL_LOC", "Local"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "127.0.0.1"),
			Port:     redisPort,
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       redisDB,
		},
		WebSocket: WebSocketConfig{
			ReadBufferSize:  wsReadBuffer,
			WriteBufferSize: wsWriteBuffer,
			CheckOrigin:     wsCheckOrigin,
		},
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func (c *MySQLConfig) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=%t&loc=%s",
		c.User, c.Password, c.Host, c.Port, c.Database, c.Charset, c.ParseTime, c.Loc)
}

func (c *RedisConfig) Addr() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}

func (c *ServerConfig) Addr() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}
