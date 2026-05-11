package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	passwords := []string{"admin123", "123456"}

	for _, password := range passwords {
		hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			fmt.Printf("Error hashing password '%s': %v\n", password, err)
			continue
		}
		fmt.Printf("Password: %s\nHash: %s\n\n", password, string(hashed))
	}
}
