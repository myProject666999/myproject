package routes

import (
	"online-repair-booking/internal/handlers"
	"online-repair-booking/pkg/database"

	"github.com/labstack/echo/v4"
)

func RegisterWorkerRoutes(g *echo.Group) {
	db := database.MySQL
	workerHandler := handlers.NewWorkerHandler(db)

	workerGroup := g.Group("/workers")
	{
		workerGroup.GET("", workerHandler.GetWorkerList)
		workerGroup.GET("/:id", workerHandler.GetWorkerDetail)
		workerGroup.GET("/:id/reviews", workerHandler.GetWorkerReviews)
		workerGroup.POST("/register", workerHandler.WorkerRegister)
	}
}
