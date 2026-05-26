package handlers

import (
	"net/http"

	"air-quality-dashboard/internal/services"

	"github.com/gofiber/fiber/v2"
)

type SettingHandler struct {
	settingService *services.SettingService
}

func NewSettingHandler() *SettingHandler {
	return &SettingHandler{
		settingService: services.NewSettingService(),
	}
}

func (h *SettingHandler) GetAllSettings(c *fiber.Ctx) error {
	settings, err := h.settingService.GetAllSettings()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"data": settings,
	})
}

func (h *SettingHandler) GetSetting(c *fiber.Ctx) error {
	key := c.Params("key")
	setting, err := h.settingService.GetSetting(key)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "Setting not found",
		})
	}

	return c.JSON(fiber.Map{
		"data": setting,
	})
}

func (h *SettingHandler) UpdateSetting(c *fiber.Ctx) error {
	var body struct {
		Key         string `json:"key"`
		Value       string `json:"value"`
		Description string `json:"description"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if body.Key == "" || body.Value == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Key and value are required",
		})
	}

	setting, err := h.settingService.UpdateSetting(body.Key, body.Value, body.Description)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"data":    setting,
		"message": "Setting updated successfully",
	})
}
