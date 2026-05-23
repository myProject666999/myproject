package middleware

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("online-voting-secret-key")

type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     int    `json:"role"`
	jwt.RegisteredClaims
}

func SetSecret(secret string) {
	jwtSecret = []byte(secret)
}

func GenerateToken(userID uint, username string, role int) (string, error) {
	claims := Claims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func AuthRequired(c *fiber.Ctx) error {
	tokenStr := extractToken(c)
	if tokenStr == "" {
		return c.Status(401).JSON(fiber.Map{"code": 401, "message": "未登录"})
	}
	claims, err := parseToken(tokenStr)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"code": 401, "message": "登录已过期"})
	}
	c.Locals("user_id", claims.UserID)
	c.Locals("username", claims.Username)
	c.Locals("role", claims.Role)
	return c.Next()
}

func AdminRequired(c *fiber.Ctx) error {
	role, ok := c.Locals("role").(int)
	if !ok || role != 9 {
		return c.Status(403).JSON(fiber.Map{"code": 403, "message": "需要管理员权限"})
	}
	return c.Next()
}

func OptionalAuth(c *fiber.Ctx) error {
	tokenStr := extractToken(c)
	if tokenStr != "" {
		if claims, err := parseToken(tokenStr); err == nil {
			c.Locals("user_id", claims.UserID)
			c.Locals("username", claims.Username)
			c.Locals("role", claims.Role)
		}
	}
	return c.Next()
}

func extractToken(c *fiber.Ctx) string {
	auth := c.Get("Authorization")
	if strings.HasPrefix(auth, "Bearer ") {
		return auth[7:]
	}
	if cookie := c.Cookies("token"); cookie != "" {
		return cookie
	}
	return ""
}

func parseToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, jwt.ErrSignatureInvalid
}
