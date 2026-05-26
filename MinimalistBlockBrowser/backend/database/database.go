package database

import (
	"database/sql"
	"fmt"
	"log"
	"minimalist-block-browser/config"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func Init(cfg *config.DatabaseConfig) error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.Name)

	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(10)
	DB.SetConnMaxLifetime(5 * time.Minute)
	DB.SetConnMaxIdleTime(1 * time.Minute)

	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("[Database] Connected successfully")
	return nil
}

func Close() {
	if DB != nil {
		DB.Close()
	}
}

func RecordQueryLog(queryType, queryValue, source string, responseTimeMs int, ipAddress, userAgent string) {
	if DB == nil {
		return
	}
	_, _ = DB.Exec(
		`INSERT INTO query_log (query_type, query_value, source, response_time, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)`,
		queryType, queryValue, source, responseTimeMs, ipAddress, userAgent,
	)
}

func GetStats() (totalQueries uint64, cacheHitCount uint64, rpcHitCount uint64, err error) {
	if DB == nil {
		return 0, 0, 0, nil
	}

	var total, cached, rpc sql.NullInt64

	_ = DB.QueryRow(`SELECT COUNT(*) FROM query_log`).Scan(&total)
	_ = DB.QueryRow(`SELECT COUNT(*) FROM query_log WHERE source = 'cache'`).Scan(&cached)
	_ = DB.QueryRow(`SELECT COUNT(*) FROM query_log WHERE source = 'rpc'`).Scan(&rpc)

	return uint64(total.Int64), uint64(cached.Int64), uint64(rpc.Int64), nil
}