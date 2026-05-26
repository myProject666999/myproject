package handlers

import (
	"net/http"
	"strconv"

	"air-quality-dashboard/internal/services"

	"github.com/gofiber/fiber/v2"
)

type CityHandler struct {
	cityService *services.CityService
	aqiService  *services.AQIService
}

func NewCityHandler() *CityHandler {
	return &CityHandler{
		cityService: services.NewCityService(),
		aqiService:  services.NewAQIService(),
	}
}

func (h *CityHandler) GetAllCities(c *fiber.Ctx) error {
	cities, err := h.cityService.GetAllCities()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"data": cities,
	})
}

func (h *CityHandler) GetAllCitiesWithLatestAQI(c *fiber.Ctx) error {
	data, err := h.cityService.GetAllCitiesWithLatestAQI()
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"data": data,
	})
}

func (h *CityHandler) GetCityByID(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid city ID",
		})
	}

	city, err := h.cityService.GetCityByID(id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "City not found",
		})
	}

	latestAQI, _ := h.aqiService.GetLatestAQIByCity(id)

	return c.JSON(fiber.Map{
		"data": fiber.Map{
			"city":        city,
			"latest_aqi":  latestAQI,
		},
	})
}
