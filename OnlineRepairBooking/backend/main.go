package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"online-repair-booking/config"
	"online-repair-booking/internal/routes"
	"online-repair-booking/pkg/database"
	"online-repair-booking/pkg/response"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	config.Load()

	if err := database.InitMySQL(); err != nil {
		log.Fatalf("Failed to initialize MySQL: %v", err)
	}
	defer database.CloseMySQL()

	if err := database.InitRedis(); err != nil {
		log.Fatalf("Failed to initialize Redis: %v", err)
	}
	defer database.CloseRedis()

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))

	setupRoutes(e)

	go func() {
		addr := ":" + config.AppConfig.AppPort
		if err := e.Start(addr); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	log.Printf("Server started on port %s", config.AppConfig.AppPort)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := e.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exiting")
}

func setupRoutes(e *echo.Echo) {
	api := e.Group("/api")

	api.GET("/health", func(c echo.Context) error {
		return response.Success(c, map[string]interface{}{
			"status":    "ok",
			"timestamp": time.Now().Unix(),
		})
	})

	api.GET("/", func(c echo.Context) error {
		return response.Success(c, map[string]interface{}{
			"message": "Online Repair Booking API",
			"version": "1.0.0",
		})
	})

	routes.RegisterUserRoutes(api)
	routes.RegisterServiceRoutes(api)
	routes.RegisterWorkerRoutes(api)
	routes.RegisterOrderRoutes(api)
	routes.RegisterReviewRoutes(api)
	routes.RegisterPaymentRoutes(api)
}
