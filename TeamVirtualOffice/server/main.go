package main

import (
	"fmt"
	"log"
	"team-virtual-office/cache"
	"team-virtual-office/config"
	"team-virtual-office/router"
	"team-virtual-office/ws"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.MySQL.User, cfg.MySQL.Password, cfg.MySQL.Host, cfg.MySQL.Port, cfg.MySQL.DBName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to MySQL: %v", err)
	}
	log.Println("MySQL connected")

	cacheMgr := cache.NewStatusManager(cfg)
	log.Println("Cache manager initialized")

	hub := ws.NewHub()
	go hub.Run()
	log.Println("WebSocket hub started")

	r := router.SetupRouter(db, cacheMgr, hub, cfg)

	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			timedOut, err := cacheMgr.CheckHeartbeatTimeout(120)
			if err != nil {
				log.Printf("heartbeat check error: %v", err)
				continue
			}
			for _, userID := range timedOut {
				cacheMgr.SetUserOffline(userID)
				hub.Broadcast <- ws.Message{
					Type: "user_offline",
					Data: map[string]interface{}{"user_id": userID},
				}
			}
		}
	}()
	log.Println("Heartbeat checker started")

	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
