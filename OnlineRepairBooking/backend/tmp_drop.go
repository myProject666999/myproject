//go:build ignore

package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	_, err = db.Exec("DROP DATABASE IF EXISTS online_repair_booking")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Database dropped successfully!")
}
