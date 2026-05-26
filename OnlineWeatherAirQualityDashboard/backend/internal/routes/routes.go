package routes

import (
	"air-quality-dashboard/internal/handlers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	cityHandler := handlers.NewCityHandler()
	aqiHandler := handlers.NewAQIHandler()
	trendHandler := handlers.NewTrendHandler()
	alertHandler := handlers.NewAlertHandler()
	settingHandler := handlers.NewSettingHandler()

	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Air Quality Dashboard API is running",
		})
	})

	cities := api.Group("/cities")
	cities.Get("", cityHandler.GetAllCities)
	cities.Get("/with-aqi", cityHandler.GetAllCitiesWithLatestAQI)
	cities.Get("/:id", cityHandler.GetCityByID)

	aqi := api.Group("/aqi")
	aqi.Get("", aqiHandler.GetAllLatestAQI)
	aqi.Get("/:cityId", aqiHandler.GetLatestAQI)
	aqi.Get("/:cityId/history", aqiHandler.GetAQIHistory)

	trends := api.Group("/trends")
	trends.Get("/city/:cityId", trendHandler.GetCityTrend)
	trends.Get("/comparison", trendHandler.GetCitiesComparison)

	alerts := api.Group("/alerts")
	alerts.Get("", alertHandler.GetAllAlerts)
	alerts.Get("/active", alertHandler.GetActiveAlerts)
	alerts.Get("/city/:cityId", alertHandler.GetAlertsByCity)
	alerts.Put("/:id/resolve", alertHandler.ResolveAlert)

	settings := api.Group("/settings")
	settings.Get("", settingHandler.GetAllSettings)
	settings.Get("/:key", settingHandler.GetSetting)
	settings.Put("", settingHandler.UpdateSetting)
}
