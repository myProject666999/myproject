package routes

import (
	"simple-webhook-reception/handlers"
	"simple-webhook-reception/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		endpoints := api.Group("/endpoints")
		{
			endpoints.POST("", handlers.CreateEndpoint)
			endpoints.GET("", handlers.ListEndpoints)
			endpoints.GET("/:id", handlers.GetEndpoint)
			endpoints.PUT("/:id", handlers.UpdateEndpoint)
			endpoints.DELETE("/:id", handlers.DeleteEndpoint)

			endpoints.GET("/:id/rules", handlers.ListForwardRules)
			endpoints.POST("/:id/rules", handlers.CreateForwardRule)
		}

		rules := api.Group("/rules")
		{
			rules.PUT("/:id", handlers.UpdateForwardRule)
			rules.DELETE("/:id", handlers.DeleteForwardRule)
		}

		requests := api.Group("/requests")
		{
			requests.GET("", handlers.ListRequests)
			requests.GET("/:id", handlers.GetRequest)
			requests.POST("/:id/resend", handlers.ResendRequest)
			requests.DELETE("/:id", handlers.DeleteRequest)
		}
	}

	webhook := r.Group("/webhook")
	{
		webhook.Any("/:token/*path", middleware.RateLimitMiddleware(), middleware.EndpointIsolationMiddleware(), handlers.ReceiveWebhook)
	}
}
