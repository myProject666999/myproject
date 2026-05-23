package main

import (
	"log"
	"wifipwd/internal/config"
	"wifipwd/internal/crypto"
	"wifipwd/internal/db"
	"wifipwd/internal/handler"
	"wifipwd/internal/repository"
	"wifipwd/internal/router"
)

func main() {
	cfg := config.Load()

	conn, err := db.Open(cfg)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer conn.Close()

	crypt := crypto.NewService(cfg.MasterKey)
	netRepo := repository.NewNetworkRepo(conn)
	shareRepo := repository.NewShareRepo(conn)
	h := handler.NewNetworkHandler(netRepo, shareRepo, crypt)

	r := router.New(h, cfg.StaticDir)
	log.Printf("listening on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("run: %v", err)
	}
}
