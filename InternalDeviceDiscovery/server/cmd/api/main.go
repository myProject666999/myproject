package main

import (
	"context"
	"internal-device-discovery/internal/database"
	"internal-device-discovery/internal/handler"
	"internal-device-discovery/internal/service"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	db, err := database.Open("data.db")
	if err != nil {
		log.Fatalf("open database: %v", err)
	}

	deviceSvc := service.NewDeviceService(db)
	scanSvc := service.NewScanService(deviceSvc)

	deviceH := handler.NewDeviceHandler(deviceSvc)
	scanH := handler.NewScanHandler(scanSvc)

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		devices := api.Group("/devices")
		{
			devices.GET("", deviceH.List)
			devices.GET("/:id", deviceH.Get)
			devices.PUT("/:id", deviceH.Update)
			devices.DELETE("/:id", deviceH.Delete)
			devices.POST("/batch-delete", deviceH.BatchDelete)
			devices.GET("/vendors", deviceH.Vendors)
		}
		scan := api.Group("/scan")
		{
			scan.GET("/networks", scanH.Networks)
			scan.POST("/start", scanH.Start)
			scan.POST("/stop", scanH.Stop)
			scan.GET("/status", scanH.Status)
			scan.GET("/stream", scanH.Stream)
		}
		api.GET("/vendor/:mac", handler.VendorHandler)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}
	go func() {
		log.Printf("server listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %v", err)
		}
	}()
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("shutdown: %v", err)
	}
}
