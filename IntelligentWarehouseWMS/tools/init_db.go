package main

import (
	"database/sql"
	"fmt"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	fmt.Println("开始连接数据库...")
	dsn := "root:123456@tcp(127.0.0.1:3306)/?charset=utf8mb4&parseTime=True&loc=Local&multiStatements=true&timeout=10s"

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Printf("Open数据库失败: %v\n", err)
		os.Exit(1)
	}
	defer db.Close()

	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)

	if err := db.Ping(); err != nil {
		fmt.Printf("Ping数据库失败: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("数据库连接成功!")

	sqlBytes, err := os.ReadFile("../sql/wms_init.sql")
	if err != nil {
		fmt.Printf("读取SQL文件失败: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("读取SQL文件成功，大小: %d 字节\n", len(sqlBytes))

	sqlContent := string(sqlBytes)
	_, err = db.Exec(sqlContent)
	if err != nil {
		fmt.Printf("执行SQL脚本失败: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("SQL脚本执行成功!")

	_, err = db.Exec("USE wms_db")
	if err != nil {
		fmt.Printf("切换数据库失败: %v\n", err)
		os.Exit(1)
	}

	rows, err := db.Query("SHOW TABLES")
	if err != nil {
		fmt.Printf("查询表失败: %v\n", err)
		os.Exit(1)
	}
	defer rows.Close()

	fmt.Println("\n数据库中的表:")
	count := 0
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err == nil {
			fmt.Printf("  - %s\n", tableName)
			count++
		}
	}
	fmt.Printf("\n共 %d 张表\n", count)

	fmt.Println("\n数据库初始化完成!")
}
