package config

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	Upload   UploadConfig
}

type ServerConfig struct {
	Host string
	Port string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	Charset  string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type JWTConfig struct {
	SecretKey string
	ExpireHours int
}

type UploadConfig struct {
	PhotoPath string
	MaxSize   int64
}

var AppConfig = Config{
	Server: ServerConfig{
		Host: "0.0.0.0",
		Port: "8080",
	},
	Database: DatabaseConfig{
		Host:     "127.0.0.1",
		Port:     "3306",
		User:     "root",
		Password: "123456",
		DBName:   "chain_store_inspection",
		Charset:  "utf8mb4",
	},
	Redis: RedisConfig{
		Host:     "127.0.0.1",
		Port:     "6379",
		Password: "",
		DB:       0,
	},
	JWT: JWTConfig{
		SecretKey:   "chain-store-inspection-secret-key-2024",
		ExpireHours: 24,
	},
	Upload: UploadConfig{
		PhotoPath: "./uploads/photos",
		MaxSize:   10 * 1024 * 1024,
	},
}
