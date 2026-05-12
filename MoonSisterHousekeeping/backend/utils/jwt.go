package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateToken(userID uint, role string, username string) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  userID,
		"role":     role,
		"username": username,
		"exp":      time.Now().Add(time.Hour * 24 * 7).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func GenerateOrderNo() string {
	return "SO" + time.Now().Format("20060102150405")
}

func GenerateContractNo() string {
	return "HT" + time.Now().Format("20060102150405")
}
