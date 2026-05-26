package config

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	ServerPort string
}

func Load() *Config {
	return &Config{
		DBHost:     "127.0.0.1",
		DBPort:     "3306",
		DBUser:     "root",
		DBPassword: "123456",
		DBName:     "online_invoice_management",
		ServerPort: "8080",
	}
}