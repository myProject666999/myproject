package main

import (
	"fmt"
	"log"

	"uav-inspection-server/config"
	"uav-inspection-server/database"
	"uav-inspection-server/router"
)

func main() {
	if err := config.LoadConfig("config.yaml"); err != nil {
		log.Fatalf("failed to load config: %v", err)
	}
	database.InitMySQL(config.AppConfig.MySQL)
	database.InitRedis(config.AppConfig.Redis)
	r := router.SetupRouter()
	addr := fmt.Sprintf(":%d", config.AppConfig.Server.Port)
	log.Printf("server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
