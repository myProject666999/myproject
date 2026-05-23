package middleware

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func AuthUserID(r *http.Request, secret string) (uint64, bool) {
	h := r.Header.Get("Authorization")
	if !strings.HasPrefix(h, "Bearer ") {
		return 0, false
	}
	tokenStr := strings.TrimPrefix(h, "Bearer ")
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return 0, false
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, false
	}
	uidv, ok := claims["uid"]
	if !ok {
		return 0, false
	}
	// numeric values from JSON may come as float64
	switch v := uidv.(type) {
	case float64:
		return uint64(v), true
	case uint64:
		return v, true
	case int64:
		return uint64(v), true
	}
	return 0, false
}

func SignToken(uid uint64, username, secret string, expireSec int64) (string, error) {
	now := time.Now()
	claims := jwt.MapClaims{
		"uid":      uid,
		"username": username,
		"iat":      now.Unix(),
		"exp":      now.Unix() + expireSec,
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}
