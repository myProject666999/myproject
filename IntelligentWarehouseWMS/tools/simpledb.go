package main

import (
"database/sql"
"fmt"
"os"

_ "github.com/go-sql-driver/mysql"
)

func main() {
dsn := "root:123456@tcp(127.0.0.1:3306)/?charset=utf8mb4&parseTime=True&loc=Local&multiStatements=true&timeout=10s"
db, err := sql.Open("mysql", dsn)
if err != nil { fmt.Println("Open err:", err); os.Exit(1) }
defer db.Close()
if err := db.Ping(); err != nil { fmt.Println("Ping err:", err); os.Exit(1) }
fmt.Println("DB connected OK")

_, err = db.Exec("CREATE DATABASE IF NOT EXISTS wms_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
if err != nil { fmt.Println("Create DB err:", err); os.Exit(1) }
fmt.Println("Database wms_db created/OK")

_, err = db.Exec("USE wms_db")
if err != nil { fmt.Println("Use DB err:", err); os.Exit(1) }
fmt.Println("Using wms_db")
fmt.Println("SUCCESS")
}
