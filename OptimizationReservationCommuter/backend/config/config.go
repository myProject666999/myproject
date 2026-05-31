package config

type Config struct {
	MySQL MySQLConfig
	Redis RedisConfig
	JWT   JWTConfig
	App   AppConfig
}

type MySQLConfig struct {
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
	Secret string
	Expire int
}

type AppConfig struct {
	Port string
	Mode string
}

var GlobalConfig *Config

func LoadConfig() *Config {
	GlobalConfig = &Config{
		MySQL: MySQLConfig{
			Host:     "127.0.0.1",
			Port:     "3306",
			User:     "root",
			Password: "123456",
			DBName:   "shuttle_booking",
		},
		Redis: RedisConfig{
			Host:     "127.0.0.1",
			Port:     "6379",
			Password: "",
			DB:       0,
		},
		JWT: JWTConfig{
			Secret: "shuttle-booking-secret-key",
			Expire: 86400,
		},
		App: AppConfig{
			Port: "8080",
			Mode: "debug",
		},
	}
	return GlobalConfig
}
