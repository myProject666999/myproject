package router

import (
	"restaurant-queue/handlers"
	"restaurant-queue/websocket"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"}
	r.Use(cors.New(config))

	api := r.Group("/api")
	{
		user := api.Group("/user")
		{
			user.POST("/login", handlers.LoginOrRegister)
			user.GET("/:id", handlers.GetUserInfo)
		}

		restaurant := api.Group("/restaurant")
		{
			restaurant.GET("", handlers.GetRestaurants)
			restaurant.GET("/:id/table-types", handlers.GetTableTypes)
			restaurant.GET("/:id", handlers.GetRestaurantDetail)
		}

		queue := api.Group("/queue")
		{
			queue.POST("", handlers.CreateQueue)
			queue.GET("/:id", handlers.GetQueueInfo)
			queue.GET("/user/:user_id", handlers.GetUserQueues)
			queue.POST("/:id/cancel", handlers.CancelQueue)
			queue.POST("/call", handlers.CallQueue)
			queue.GET("/called/:restaurant_id", handlers.GetCalledQueues)
			queue.GET("/waiting/:restaurant_id/:prefix", handlers.GetWaitingQueues)
			queue.POST("/over", handlers.MarkOverQueue)
			queue.POST("/seated", handlers.MarkSeatedQueue)
			queue.POST("/completed", handlers.MarkCompletedQueue)
		}

		reservation := api.Group("/reservation")
		{
			reservation.POST("", handlers.CreateReservation)
			reservation.GET("/user/:user_id", handlers.GetUserReservations)
			reservation.POST("/:id/cancel", handlers.CancelReservation)
			reservation.GET("/timeslots/:restaurant_id/:table_type_id", handlers.GetAvailableTimeSlots)
			reservation.POST("/verify", handlers.VerifyReservation)
		}
	}

	r.GET("/ws", websocket.HandleWebSocket)

	return r
}
