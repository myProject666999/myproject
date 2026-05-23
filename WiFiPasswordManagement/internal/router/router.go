package router

import (
	"net/http"
	"wifipwd/internal/handler"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func New(h *handler.NetworkHandler, staticDir string) *gin.Engine {
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.GET("/networks", h.List)
		api.POST("/networks", h.Create)
		api.GET("/networks/expired", h.Expired)
		api.GET("/networks/:id", h.Get)
		api.PUT("/networks/:id", h.Update)
		api.DELETE("/networks/:id", h.Delete)
		api.GET("/networks/:id/qr", h.QR)
		api.GET("/networks/:id/shares", h.ListShares)
		api.POST("/networks/:id/shares", h.CreateShare)
		api.DELETE("/shares/:shareId", h.DeleteShare)
		api.GET("/share/:token", h.GetByShare)
	}

	r.StaticFS("/static", http.Dir(staticDir))
	r.NoRoute(func(c *gin.Context) {
		if staticDir != "" {
			c.File(staticDir + "/index.html")
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		}
	})

	return r
}
