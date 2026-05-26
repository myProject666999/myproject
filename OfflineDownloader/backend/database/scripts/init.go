package scripts

import (
	"database/sql"
	"fmt"
	"log"
	"offlinedownloader/config"

	_ "github.com/go-sql-driver/mysql"
)

func CreateDatabase() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/?charset=utf8mb4&parseTime=True&loc=Local",
		config.AppConfig.DBUser,
		config.AppConfig.DBPassword,
		config.AppConfig.DBHost,
		config.AppConfig.DBPort,
	)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to MySQL server: %v", err)
	}
	defer db.Close()

	createDBQuery := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", config.AppConfig.DBName)
	_, err = db.Exec(createDBQuery)
	if err != nil {
		log.Fatalf("Failed to create database: %v", err)
	}

	log.Printf("Database '%s' created successfully", config.AppConfig.DBName)
}

func InitDefaultSettings(db *sql.DB) {
	settings := []struct {
		key         string
		value       string
		description string
	}{
		{"download_path", "./downloads", "默认下载目录"},
		{"max_concurrent_downloads", "5", "最大同时下载数"},
		{"aria2_rpc_url", "http://127.0.0.1:6800/jsonrpc", "aria2 RPC地址"},
		{"aria2_rpc_secret", "", "aria2 RPC密钥"},
		{"auto_delete_completed", "0", "自动删除已完成任务（天），0表示不删除"},
	}

	for _, s := range settings {
		query := "INSERT IGNORE INTO settings (`key`, `value`, `description`) VALUES (?, ?, ?)"
		_, err := db.Exec(query, s.key, s.value, s.description)
		if err != nil {
			log.Printf("Warning: Failed to insert setting '%s': %v", s.key, err)
		}
	}

	log.Println("Default settings initialized")
}
