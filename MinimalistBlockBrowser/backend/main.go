package main

import (
	"context"
	"log"
	"minimalist-block-browser/cache"
	"minimalist-block-browser/config"
	"minimalist-block-browser/database"
	"minimalist-block-browser/routes"
	"minimalist-block-browser/web3"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("Starting Minimalist Block Browser...")

	cfg := config.Load()

	if err := database.Init(&cfg.Database); err != nil {
		log.Printf("[Warning] Database initialization failed: %v", err)
		log.Println("Continuing without database...")
	}
	defer database.Close()

	cacheInstance := cache.GetInstance()
	go startCacheCleaner(cacheInstance)

	rpcClient := web3.NewRPCClient(cfg.Web3.RPCEndpoint, cfg.Web3.APIKey)

	chainID, err := rpcClient.ChainID()
	if err != nil {
		log.Printf("[Warning] Failed to connect to RPC endpoint: %v", err)
	} else {
		log.Printf("[Web3] Connected to %s (Chain ID: %s)", cfg.Web3.NetworkName, chainID)
	}

	r := routes.SetupRouter(cfg, rpcClient)

	srv := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      r,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
	}

	go func() {
		log.Printf("[Server] Starting on port %s", cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}

func startCacheCleaner(c *cache.Cache) {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		c.Cleanup()
		log.Printf("[Cache] Cleanup complete, size: %d", c.Size())
	}
}