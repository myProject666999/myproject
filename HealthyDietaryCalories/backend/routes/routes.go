package routes

import (
	"healthy-diet-backend/handlers"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	api := app.Group("/api")

	api.Get("/export", handlers.ExportAllData)
	api.Get("/statistics", handlers.GetStatistics)

	api.Get("/foods/search", handlers.SearchFoods)
	api.Get("/foods/categories", handlers.GetFoodCategories)
	api.Get("/foods/:id", handlers.GetFood)
	api.Get("/foods", handlers.GetFoods)
	api.Post("/foods", handlers.CreateFood)
	api.Put("/foods/:id", handlers.UpdateFood)
	api.Delete("/foods/:id", handlers.DeleteFood)

	api.Get("/meals", handlers.GetMealsByDate)
	api.Post("/meals", handlers.CreateMeal)
	api.Delete("/meals/:id", handlers.DeleteMeal)
	api.Post("/meals/:id/items", handlers.AddMealItem)
	api.Put("/meals/items/:itemId", handlers.UpdateMealItem)
	api.Delete("/meals/items/:itemId", handlers.DeleteMealItem)

	api.Get("/daily/summary", handlers.GetDailySummary)
	api.Get("/daily/goal", handlers.GetDailyGoal)
	api.Post("/daily/goal", handlers.SetDailyGoal)

	api.Get("/weight", handlers.GetWeightRecords)
	api.Post("/weight", handlers.AddWeightRecord)
	api.Delete("/weight/:id", handlers.DeleteWeightRecord)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})
}
