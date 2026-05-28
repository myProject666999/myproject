package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	password := "admin123"
	hash := "$2a$10$F6/8ByueWOsVCGIXqiuNGe9vXqeWitQpPNGZK2l8oLeNeC4D2x79a"

	fmt.Println("Password:", password)
	fmt.Println("Hash:", hash)

	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		fmt.Println("Match: false, Error:", err)
	} else {
		fmt.Println("Match: true")
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Generate error:", err)
		return
	}
	fmt.Println("New Hash:", string(newHash))

	err = bcrypt.CompareHashAndPassword(newHash, []byte(password))
	if err != nil {
		fmt.Println("New Match: false, Error:", err)
	} else {
		fmt.Println("New Match: true")
	}
}
