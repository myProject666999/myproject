package handlers

import (
	"net/http"
	"strconv"

	"air-quality-dashboard/internal/services"

	"github.com/gofiber/fiber/v2"
)

type AQIHandler struct {
	aqiService *services.AQIService
}

func NewAQIHandler() *AQIHandler {
	return &AQIHandler{
		aqiService: services.NewAQIService(),
	}
}

func (h *AQIHandler) GetLatestAQI(c *fiber.Ctx) error {
	cityID, err := strconv.Atoi(c.Params("cityId"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid city ID",
		})
	}

	record, err := h.aqiService.GetLatestAQIByCity(cityID)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "No AQI data found",
		})
	}

	return c.JSON(fiber.Map{
		"data": record,
	})
}

func (h *AQIHandler) GetAQIHistory(c *fiber.Ctx) error {
	cityID, err := strconv.Atoi(c.Params("cityId"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid city ID",
		})
	}

	hours, _ := strconv.Atoi(c.Query("hours", "24"))
	if hours <= 0 {
		hours = 24
	}

	records, err := h.aqiService.GetAQIHistory(cityID, hours)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"data":  records,
		"count": len(records),
	})
}

func (h *AQIHandler) GetAllLatestAQI(c *fiber.Ctx) error {
	records, err := h.aqiService.GetAllLatestAQI()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"data": records,
	})
}
