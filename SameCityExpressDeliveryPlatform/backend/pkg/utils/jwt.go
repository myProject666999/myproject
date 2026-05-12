package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrTokenExpired     = errors.New("token is expired")
	ErrTokenNotValidYet = errors.New("token not active yet")
	ErrTokenMalformed   = errors.New("that's not even a token")
	ErrTokenInvalid     = errors.New("couldn't handle this token")
)

type JwtClaims struct {
	UserID   uint   `json:"user_id"`
	RiderID  uint   `json:"rider_id"`
	AdminID  uint   `json:"admin_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

var jwtSecret = []byte("samecity-express-jwt-secret-key-2024")

func GenerateToken(userId uint, riderId uint, adminId uint, username, role string) (string, error) {
	claims := JwtClaims{
		UserID:   userId,
		RiderID:  riderId,
		AdminID:  adminId,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "samecity-express",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ParseToken(tokenString string) (*JwtClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JwtClaims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenMalformed) {
			return nil, ErrTokenMalformed
		} else if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrTokenExpired
		} else if errors.Is(err, jwt.ErrTokenNotValidYet) {
			return nil, ErrTokenNotValidYet
		} else {
			return nil, ErrTokenInvalid
		}
	}

	if claims, ok := token.Claims.(*JwtClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, ErrTokenInvalid
}
