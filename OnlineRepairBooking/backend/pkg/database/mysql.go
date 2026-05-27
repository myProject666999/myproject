package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"online-repair-booking/config"
	"online-repair-booking/pkg/utils"

	_ "github.com/go-sql-driver/mysql"
)

var MySQL *sql.DB

func InitMySQL() error {
	cfg := config.AppConfig

	dsnNoDB := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.MySQLUser, cfg.MySQLPass, cfg.MySQLHost, cfg.MySQLPort)

	db, err := sql.Open("mysql", dsnNoDB)
	if err != nil {
		return fmt.Errorf("failed to connect to MySQL: %w", err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		return fmt.Errorf("failed to ping MySQL: %w", err)
	}

	dropDBQuery := fmt.Sprintf("DROP DATABASE IF EXISTS `%s`", cfg.MySQLDB)
	if _, err = db.Exec(dropDBQuery); err != nil {
		return fmt.Errorf("failed to drop database: %w", err)
	}

	createDBQuery := fmt.Sprintf("CREATE DATABASE `%s` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", cfg.MySQLDB)
	if _, err = db.Exec(createDBQuery); err != nil {
		return fmt.Errorf("failed to create database: %w", err)
	}

	dsnWithDB := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.MySQLUser, cfg.MySQLPass, cfg.MySQLHost, cfg.MySQLPort, cfg.MySQLDB)

	MySQL, err = sql.Open("mysql", dsnWithDB)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	if err = MySQL.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	MySQL.SetMaxOpenConns(100)
	MySQL.SetMaxIdleConns(20)
	MySQL.SetConnMaxLifetime(time.Hour)

	if err = initSchema(); err != nil {
		return fmt.Errorf("failed to initialize schema: %w", err)
	}

	log.Println("MySQL initialized successfully")
	return nil
}

func initSchema() error {
	tablesExist, err := checkTablesExist()
	if err != nil {
		return err
	}

	if tablesExist {
		log.Println("Tables already exist, skipping schema initialization")
		return nil
	}

	schemaPath := filepath.Join("..", "database", "schema.sql")
	if _, err := os.Stat(schemaPath); os.IsNotExist(err) {
		altPath := filepath.Join("database", "schema.sql")
		if _, err := os.Stat(altPath); err == nil {
			schemaPath = altPath
		} else {
			wd, _ := os.Getwd()
			schemaPath = filepath.Join(filepath.Dir(filepath.Dir(wd)), "database", "schema.sql")
		}
	}

	sqlContent, err := os.ReadFile(schemaPath)
	if err != nil {
		return fmt.Errorf("failed to read schema file: %w", err)
	}

	log.Printf("Schema file read: %s, size: %d bytes", schemaPath, len(sqlContent))

	statements := splitSQLStatements(string(sqlContent))
	log.Printf("Split into %d statements", len(statements))

	hash, hashErr := utils.HashPassword("123456")
	if hashErr != nil {
		log.Printf("Warning: failed to generate password hash: %v", hashErr)
	}

	for i, stmt := range statements {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" {
			continue
		}
		// Remove leading comment lines but keep the SQL
		lines := strings.Split(stmt, "\n")
		sqlLines := make([]string, 0)
		for _, line := range lines {
			trimmed := strings.TrimSpace(line)
			if trimmed != "" && !strings.HasPrefix(trimmed, "--") {
				sqlLines = append(sqlLines, line)
			}
		}
		if len(sqlLines) == 0 {
			continue
		}
		stmt = strings.Join(sqlLines, "\n")
		if hashErr == nil {
			stmt = strings.ReplaceAll(stmt, "'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68L17lhWy'", "'"+string(hash)+"'")
			stmt = strings.ReplaceAll(stmt, "'$2a$10$ipG2513cfWuwoVOIf2mPQORpOFr6hbzQn91IWJkZ/9iW5CdadP.YS'", "'"+string(hash)+"'")
		}
		log.Printf("Executing stmt %d: %.80s", i, stmt)
		if _, err := MySQL.Exec(stmt); err != nil {
			log.Printf("Error executing SQL stmt %d: %v", i, err)
		}
	}

	log.Println("Schema initialized successfully")
	return nil
}

func checkTablesExist() (bool, error) {
	query := `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ?`
	var count int
	err := MySQL.QueryRow(query, config.AppConfig.MySQLDB).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func splitSQLStatements(sql string) []string {
	var statements []string
	var current strings.Builder
	inString := false
	stringChar := rune(0)

	for _, char := range sql {
		switch {
		case !inString && (char == '"' || char == '\'' || char == '`'):
			inString = true
			stringChar = char
			current.WriteRune(char)
		case inString && char == stringChar:
			inString = false
			stringChar = rune(0)
			current.WriteRune(char)
		case !inString && char == ';':
			statements = append(statements, current.String())
			current.Reset()
		default:
			current.WriteRune(char)
		}
	}

	if current.Len() > 0 {
		statements = append(statements, current.String())
	}

	return statements
}

func CloseMySQL() {
	if MySQL != nil {
		MySQL.Close()
		log.Println("MySQL connection closed")
	}
}
