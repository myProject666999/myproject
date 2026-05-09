package util

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var JwtSecret = []byte("your-secret-key-hospital-management-system-2024")

type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	RoleID   uint   `json:"role_id"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, username string, roleID uint, expire int) (string, error) {
	claims := Claims{
		UserID:   userID,
		Username: username,
		RoleID:   roleID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Second * time.Duration(expire))),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "hospital-management-system",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JwtSecret)
}

func ParseToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return JwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
