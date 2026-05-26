package main

import (
	"io/ioutil"
	"log"
	"offlinedownloader/config"
	"offlinedownloader/database/scripts"

	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	log.Println("Initializing database...")

	config.LoadConfig()

	scripts.CreateDatabase()

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local&collation=utf8mb4_unicode_ci",
		config.AppConfig.DBUser,
		config.AppConfig.DBPassword,
		config.AppConfig.DBHost,
		config.AppConfig.DBPort,
		config.AppConfig.DBName,
	)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	db.Exec("SET NAMES utf8mb4")
	db.Exec("SET CHARACTER SET utf8mb4")
	db.Exec("SET collation_connection = 'utf8mb4_unicode_ci'")

	sqlFile := "./database/scripts/init.sql"
	sqlContent, err := ioutil.ReadFile(sqlFile)
	if err != nil {
		log.Fatalf("Failed to read SQL file: %v", err)
	}

	statements := splitSQLStatements(string(sqlContent))
	for _, stmt := range statements {
		stmt = trimSQL(stmt)
		if stmt == "" {
			continue
		}
		if _, err := db.Exec(stmt); err != nil {
			log.Printf("Warning: Failed to execute SQL: %v", err)
			if len(stmt) > 100 {
				log.Printf("SQL: %s", stmt[:100])
			} else {
				log.Printf("SQL: %s", stmt)
			}
		}
	}

	scripts.InitDefaultSettings(db)

	log.Println("Database initialization completed successfully!")
}

func splitSQLStatements(sql string) []string {
	var statements []string
	var current string
	var inString bool
	var stringChar byte

	for i := 0; i < len(sql); i++ {
		ch := sql[i]

		if inString {
			current += string(ch)
			if ch == stringChar && (i == 0 || sql[i-1] != '\\') {
				inString = false
			}
			continue
		}

		if ch == '\'' || ch == '"' {
			inString = true
			stringChar = ch
			current += string(ch)
			continue
		}

		if ch == ';' {
			statements = append(statements, current)
			current = ""
			continue
		}

		if ch == '-' && i+1 < len(sql) && sql[i+1] == '-' {
			for i < len(sql) && sql[i] != '\n' {
				i++
			}
			continue
		}

		current += string(ch)
	}

	if current != "" {
		statements = append(statements, current)
	}

	return statements
}

func trimSQL(sql string) string {
	var result string
	var inLineComment bool
	var inBlockComment bool

	for i := 0; i < len(sql); i++ {
		if inBlockComment {
			if sql[i] == '*' && i+1 < len(sql) && sql[i+1] == '/' {
				inBlockComment = false
				i++
			}
			continue
		}

		if inLineComment {
			if sql[i] == '\n' {
				inLineComment = false
			}
			continue
		}

		if sql[i] == '-' && i+1 < len(sql) && sql[i+1] == '-' {
			inLineComment = true
			i++
			continue
		}

		if sql[i] == '/' && i+1 < len(sql) && sql[i+1] == '*' {
			inBlockComment = true
			i++
			continue
		}

		result += string(sql[i])
	}

	var trimmed string
	for _, ch := range result {
		if ch == '\n' || ch == '\r' || ch == '\t' {
			trimmed += " "
		} else {
			trimmed += string(ch)
		}
	}

	for len(trimmed) > 0 && trimmed[0] == ' ' {
		trimmed = trimmed[1:]
	}
	for len(trimmed) > 0 && trimmed[len(trimmed)-1] == ' ' {
		trimmed = trimmed[:len(trimmed)-1]
	}

	return trimmed
}
