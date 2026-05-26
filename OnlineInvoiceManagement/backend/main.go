package main

import (
	"log"
	"online-invoice-management/internal/config"
	"online-invoice-management/internal/db"
	"online-invoice-management/internal/handler"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	cfg := config.Load()

	if err := db.Init(cfg); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))

	api := e.Group("/api")

	titles := api.Group("/titles")
	titles.GET("", handler.GetTitles)
	titles.GET("/:id", handler.GetTitle)
	titles.POST("", handler.CreateTitle)
	titles.PUT("/:id", handler.UpdateTitle)
	titles.DELETE("/:id", handler.DeleteTitle)

	apps := api.Group("/applications")
	apps.GET("", handler.GetApplications)
	apps.GET("/:id", handler.GetApplication)
	apps.POST("", handler.CreateApplication)
	apps.POST("/:id/review", handler.ReviewApplication)
	apps.GET("/:id/status-flow", handler.StatusFlow)

	invoices := api.Group("/invoices")
	invoices.GET("", handler.GetInvoices)
	invoices.GET("/:id", handler.GetInvoice)
	invoices.POST("/:id/issue", handler.IssueInvoice)

	api.GET("/statistics", handler.GetStatistics)

	log.Printf("Server starting on port %s", cfg.ServerPort)
	if err := e.Start(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}