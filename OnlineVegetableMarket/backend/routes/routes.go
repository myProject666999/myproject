package routes

import (
	"github.com/gofiber/fiber/v2"

	"vegetable-market/handlers"
	"vegetable-market/middleware"
)

func SetupRoutes(app *fiber.App) {
	authHandler := handlers.NewAuthHandler()
	productHandler := handlers.NewProductHandler()
	cartHandler := handlers.NewCartHandler()
	orderHandler := handlers.NewOrderHandler()
	inventoryHandler := handlers.NewInventoryHandler()
	slotHandler := handlers.NewDeliverySlotHandler()

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	api := app.Group("/api")

	api.Post("/auth/register", authHandler.Register)
	api.Post("/auth/login", authHandler.Login)

	api.Get("/categories", productHandler.GetCategories)
	api.Get("/products", productHandler.GetProducts)
	api.Get("/products/:id", productHandler.GetProduct)

	api.Get("/delivery-slots", slotHandler.GetSlots)
	api.Get("/delivery-slots/available", slotHandler.GetAvailableSlots)

	auth := api.Group("", middleware.AuthRequired())

	auth.Get("/auth/profile", authHandler.Profile)
	auth.Put("/auth/profile", authHandler.UpdateProfile)

	auth.Get("/cart", cartHandler.GetCart)
	auth.Post("/cart", cartHandler.AddToCart)
	auth.Put("/cart/:id", cartHandler.UpdateCartItem)
	auth.Delete("/cart/:id", cartHandler.RemoveFromCart)
	auth.Put("/cart/batch/select", cartHandler.BatchUpdateSelect)
	auth.Delete("/cart", cartHandler.ClearCart)

	auth.Post("/orders", orderHandler.CreateOrder)
	auth.Get("/orders", orderHandler.GetOrders)
	auth.Get("/orders/:id", orderHandler.GetOrder)

	merchant := api.Group("", middleware.AuthRequired(), middleware.RoleRequired("merchant", "admin"))

	merchant.Post("/products", productHandler.CreateProduct)
	merchant.Put("/products/:id", productHandler.UpdateProduct)
	merchant.Delete("/products/:id", productHandler.DeleteProduct)

	merchant.Get("/inventory", inventoryHandler.GetInventory)
	merchant.Put("/inventory", inventoryHandler.UpdateInventory)
	merchant.Get("/inventory/product/:id", inventoryHandler.GetInventoryByProduct)

	merchant.Post("/delivery-slots", slotHandler.CreateSlot)
	merchant.Put("/delivery-slots/:id", slotHandler.UpdateSlot)
	merchant.Delete("/delivery-slots/:id", slotHandler.DeleteSlot)
	merchant.Post("/delivery-slots/generate", slotHandler.GenerateWeeklySlots)

	merchant.Put("/orders/:id/status", orderHandler.UpdateOrderStatus)
	merchant.Post("/orders/:id/delivery", orderHandler.AddDeliveryRecord)
}
