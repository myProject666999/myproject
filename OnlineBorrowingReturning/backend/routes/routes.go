package routes

import (
	"online-borrowing-returning/handlers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	itemHandler := handlers.NewItemHandler()
	borrowHandler := handlers.NewBorrowHandler()
	reservationHandler := handlers.NewReservationHandler()

	v1 := api.Group("/v1")

	v1.Get("/stats/items", itemHandler.GetItemStats)
	v1.Get("/stats/borrows", borrowHandler.GetBorrowStats)

	items := v1.Group("/items")
	items.Get("/", itemHandler.GetItems)
	items.Get("/:id", itemHandler.GetItem)
	items.Post("/", itemHandler.CreateItem)
	items.Put("/:id", itemHandler.UpdateItem)
	items.Delete("/:id", itemHandler.DeleteItem)

	borrows := v1.Group("/borrows")
	borrows.Get("/", borrowHandler.GetBorrows)
	borrows.Get("/:id", borrowHandler.GetBorrow)
	borrows.Post("/", borrowHandler.CreateBorrow)
	borrows.Put("/:id/return", borrowHandler.ReturnItem)

	reservations := v1.Group("/reservations")
	reservations.Get("/", reservationHandler.GetReservations)
	reservations.Get("/:id", reservationHandler.GetReservation)
	reservations.Post("/", reservationHandler.CreateReservation)
	reservations.Put("/:id/cancel", reservationHandler.CancelReservation)
	reservations.Get("/item/:itemId/queue", reservationHandler.GetItemReservationQueue)
}
