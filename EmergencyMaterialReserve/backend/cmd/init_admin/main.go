package main

import (
	"fmt"

	"emergency-material/config"
	"emergency-material/internal/database"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	if err := config.LoadConfig("config/config.yaml"); err != nil {
		panic(err)
	}

	if err := database.InitMySQL(); err != nil {
		panic(err)
	}

	password := "admin123"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}

	hashStr := string(hash)
	fmt.Println("Generated hash:", hashStr)

	result := database.DB.Exec("UPDATE users SET password = ? WHERE username = ?", hashStr, "admin")
	if result.Error != nil {
		panic(result.Error)
	}

	fmt.Printf("Updated %d row(s)\n", result.RowsAffected)

	var storedPwd string
	database.DB.Raw("SELECT password FROM users WHERE username = ?", "admin").Scan(&storedPwd)
	fmt.Println("Stored hash:", storedPwd)

	err = bcrypt.CompareHashAndPassword([]byte(storedPwd), []byte(password))
	if err != nil {
		fmt.Println("Password verification FAILED:", err)
	} else {
		fmt.Println("Password verification SUCCESS!")
	}
}
