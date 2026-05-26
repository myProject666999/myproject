package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"

	"vegetable-market/config"
	"vegetable-market/middleware"
	"vegetable-market/models"
)

type AuthHandler struct{}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req models.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var existing models.User
	if err := config.Cfg.DB.Where("username = ?", req.Username).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Username already exists"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	user := models.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Phone:    req.Phone,
		Address:  req.Address,
		Role:     "customer",
	}

	if err := config.Cfg.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create user"})
	}

	token, err := middleware.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user":  user.ToResponse(),
	})
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var user models.User
	if err := config.Cfg.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	token, err := middleware.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user":  user.ToResponse(),
	})
}

func (h *AuthHandler) Profile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint64)

	var user models.User
	if err := config.Cfg.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(fiber.Map{"user": user.ToResponse()})
}

func (h *AuthHandler) UpdateProfile(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint64)

	var req struct {
		Phone   string `json:"phone"`
		Address string `json:"address"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	updates := models.User{}
	if req.Phone != "" {
		updates.Phone = req.Phone
	}
	if req.Address != "" {
		updates.Address = req.Address
	}
	updates.UpdatedAt = time.Now()

	if err := config.Cfg.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update profile"})
	}

	var user models.User
	config.Cfg.DB.First(&user, userID)

	return c.JSON(fiber.Map{"user": user.ToResponse()})
}
