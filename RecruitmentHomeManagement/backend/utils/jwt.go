package utils

import (
	"errors"
	"recruithub/config"
	"recruithub/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID uint         `json:"user_id"`
	Role   models.Role  `json:"role"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, role models.Role) (string, error) {
	cfg := config.LoadConfig()
	claims := Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.JWTSecret))
}

func ParseToken(tokenString string) (*Claims, error) {
	cfg := config.LoadConfig()
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(cfg.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}
