package routes

import (
	"online-repair-booking/internal/handlers"
	"online-repair-booking/internal/middleware"
	"online-repair-booking/pkg/database"

	"github.com/labstack/echo/v4"
)

func RegisterReviewRoutes(g *echo.Group) {
	db := database.MySQL
	reviewHandler := handlers.NewReviewHandler(db)

	reviewGroup := g.Group("/reviews")
	{
		reviewGroup.GET("", reviewHandler.GetReviewList)
		reviewGroup.GET("/my", reviewHandler.GetMyReviews, middleware.JWTAuth(), middleware.UserAuth())
		reviewGroup.POST("", reviewHandler.CreateReview, middleware.JWTAuth(), middleware.UserAuth())
		reviewGroup.POST("/reply", reviewHandler.ReplyReview, middleware.JWTAuth(), middleware.WorkerAuth())
	}
}
