package database

import (
	"database/sql"
	"fmt"
	"log"

	"seoratingtool/config"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB(cfg *config.DatabaseConfig) error {
	var err error
	dsn := cfg.DSN()
	
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("连接数据库失败: %w", err)
	}

	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(5)

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("测试数据库连接失败: %w", err)
	}

	log.Println("数据库连接成功")
	return nil
}

func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}
