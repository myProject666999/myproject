//go:build ignore

package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	db, err := sql.Open("mysql", "root:123456@tcp(127.0.0.1:3306)/online_repair_booking")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	hash, err := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	result, err := db.Exec("UPDATE users SET password = ?", string(hash))
	if err != nil {
		log.Fatal(err)
	}

	rows, _ := result.RowsAffected()
	fmt.Printf("Updated %d users with new password hash\n", rows)
	fmt.Printf("Hash: %s\n", string(hash))
}
