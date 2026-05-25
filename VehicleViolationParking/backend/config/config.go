package config

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
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
	DBName   string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type JWTConfig struct {
	Secret     string
	ExpireHour int
}

func LoadConfig() *Config {
	return &Config{
		Server: ServerConfig{
			Port: "8080",
			Mode: "debug",
		},
		Database: DatabaseConfig{
			Host:     "127.0.0.1",
			Port:     "3306",
			User:     "root",
			Password: "123456",
			DBName:   "vehicle_parking",
		},
		Redis: RedisConfig{
			Host:     "127.0.0.1",
			Port:     "6379",
			Password: "",
			DB:       0,
		},
		JWT: JWTConfig{
			Secret:     "vehicle-parking-secret-key-2024",
			ExpireHour: 24,
		},
	}
}

func (c *DatabaseConfig) DSN() string {
	return c.User + ":" + c.Password + "@tcp(" + c.Host + ":" + c.Port + ")/" + c.DBName + "?charset=utf8mb4&parseTime=True&loc=Local"
}
