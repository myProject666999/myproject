package handlers

import (
	"net/http"
	"strconv"

	"air-quality-dashboard/internal/services"

	"github.com/gofiber/fiber/v2"
)

type AlertHandler struct {
	alertService *services.AlertService
}

func NewAlertHandler() *AlertHandler {
	return &AlertHandler{
		alertService: services.NewAlertService(),
	}
}

func (h *AlertHandler) GetActiveAlerts(c *fiber.Ctx) error {
	alerts, err := h.alertService.GetActiveAlerts()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"data":  alerts,
		"count": len(alerts),
	})
}

func (h *AlertHandler) GetAlertsByCity(c *fiber.Ctx) error {
	cityID, err := strconv.Atoi(c.Params("cityId"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid city ID",
		})
	}

	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	alerts, err := h.alertService.GetAlertsByCity(cityID, limit)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"data":  alerts,
		"count": len(alerts),
	})
}

func (h *AlertHandler) GetAllAlerts(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))

	offset := (page - 1) * pageSize

	alerts, total, err := h.alertService.GetAllAlerts(pageSize, offset)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"data":      alerts,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (h *AlertHandler) ResolveAlert(c *fiber.Ctx) error {
	id, err := strconv.ParseInt(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid alert ID",
		})
	}

	err = h.alertService.ResolveAlert(id)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Alert resolved successfully",
	})
}
