package routes

import (
	"travelplanner/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		trips := api.Group("/trips")
		{
			trips.GET("", handlers.GetTrips)
			trips.GET("/:id", handlers.GetTrip)
			trips.POST("", handlers.CreateTrip)
			trips.PUT("/:id", handlers.UpdateTrip)
			trips.DELETE("/:id", handlers.DeleteTrip)

			trips.GET("/:id/map", handlers.GetTripMapData)
			trips.GET("/:id/share", handlers.GenerateShareLink)

			days := trips.Group("/:trip_id/days")
			{
				days.GET("", handlers.GetDays)
				days.POST("", handlers.CreateDay)
			}

			day := api.Group("/days")
			{
				day.PUT("/:id", handlers.UpdateDay)
				day.DELETE("/:id", handlers.DeleteDay)

				attractions := day.Group("/:day_id/attractions")
				{
					attractions.GET("", handlers.GetAttractions)
					attractions.POST("", handlers.CreateAttraction)
				}
			}

			attractions := api.Group("/attractions")
			{
				attractions.GET("", handlers.GetAllAttractions)
				attractions.GET("/:id", handlers.GetAttraction)
				attractions.PUT("/:id", handlers.UpdateAttraction)
				attractions.DELETE("/:id", handlers.DeleteAttraction)
			}

			budgets := trips.Group("/:trip_id/budgets")
			{
				budgets.GET("", handlers.GetBudgets)
				budgets.GET("/summary", handlers.GetBudgetSummary)
				budgets.POST("", handlers.CreateBudget)
			}

			budget := api.Group("/budgets")
			{
				budget.PUT("/:id", handlers.UpdateBudget)
				budget.DELETE("/:id", handlers.DeleteBudget)
			}
		}

		share := api.Group("/share")
		{
			share.GET("/:token", handlers.GetSharedTrip)
		}
	}
}
