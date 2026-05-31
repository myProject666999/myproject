package database

import (
	"log"
	"restaurant-queue/config"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

var DB *gorm.DB

func InitMySQL() error {
	var err error
	DB, err = gorm.Open("mysql", config.AppConfig.MySQL.DSN())
	if err != nil {
		return err
	}

	DB.SingularTable(true)
	DB.DB().SetMaxIdleConns(10)
	DB.DB().SetMaxOpenConns(100)

	if err = DB.DB().Ping(); err != nil {
		return err
	}

	log.Println("MySQL connected successfully")
	return nil
}

func CloseMySQL() {
	if DB != nil {
		DB.Close()
	}
}
