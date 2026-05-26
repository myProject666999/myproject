package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"air-quality-dashboard/internal/services"

	"github.com/gofiber/fiber/v2"
)

type TrendHandler struct {
	trendService *services.TrendService
	cityService  *services.CityService
}

func NewTrendHandler() *TrendHandler {
	return &TrendHandler{
		trendService: services.NewTrendService(),
		cityService:  services.NewCityService(),
	}
}

func (h *TrendHandler) GetCityTrend(c *fiber.Ctx) error {
	cityID, err := strconv.Atoi(c.Params("cityId"))
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid city ID",
		})
	}

	days, _ := strconv.Atoi(c.Query("days", "7"))
	if days <= 0 {
		days = 7
	}

	trends, err := h.trendService.GetCityTrend(cityID, days)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	city, _ := h.cityService.GetCityByID(cityID)

	return c.JSON(fiber.Map{
		"data":  trends,
		"city":  city,
		"count": len(trends),
	})
}

func (h *TrendHandler) GetCitiesComparison(c *fiber.Ctx) error {
	citiesParam := c.Query("cities", "")
	if citiesParam == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Please provide city IDs",
		})
	}

	var cityIDs []int
	for _, idStr := range strings.Split(citiesParam, ",") {
		id, err := strconv.Atoi(strings.TrimSpace(idStr))
		if err == nil {
			cityIDs = append(cityIDs, id)
		}
	}

	if len(cityIDs) == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "No valid city IDs provided",
		})
	}

	days, _ := strconv.Atoi(c.Query("days", "7"))
	if days <= 0 {
		days = 7
	}

	result, err := h.trendService.GetCitiesComparison(cityIDs, days)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	var cities []interface{}
	for _, cityID := range cityIDs {
		city, _ := h.cityService.GetCityByID(cityID)
		cities = append(cities, fiber.Map{
			"city":   city,
			"trends": result[cityID],
		})
	}

	return c.JSON(fiber.Map{
		"data": cities,
	})
}
