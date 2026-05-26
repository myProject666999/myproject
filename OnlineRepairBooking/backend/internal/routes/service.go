package routes

import (
	"online-repair-booking/internal/handlers"
	"online-repair-booking/pkg/database"

	"github.com/labstack/echo/v4"
)

func RegisterServiceRoutes(g *echo.Group) {
	db := database.MySQL
	serviceHandler := handlers.NewServiceHandler(db)

	serviceGroup := g.Group("/services")
	{
		serviceGroup.GET("/categories", serviceHandler.GetCategoryList)
		serviceGroup.GET("", serviceHandler.GetServiceList)
		serviceGroup.GET("/:id", serviceHandler.GetServiceDetail)
		serviceGroup.GET("/time-slots", serviceHandler.GetTimeSlots)
	}
}
