package config

import (
	"fmt"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

var DB *gorm.DB

func InitDB(cfg *Config) error {
	tempDSN := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort)

	tempDB, err := gorm.Open("mysql", tempDSN)
	if err != nil {
		return fmt.Errorf("failed to connect MySQL: %v", err)
	}
	defer tempDB.Close()

	tempDB.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", cfg.DBName))

	var errMain error
	DB, errMain = gorm.Open("mysql", cfg.GetDSN())
	if errMain != nil {
		return fmt.Errorf("failed to connect database: %v", errMain)
	}

	DB.LogMode(true)
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
