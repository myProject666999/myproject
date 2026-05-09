package main

import (
	"fmt"
	"log"

	"hospital-management-system/internal/config"
	"hospital-management-system/internal/dao"
	"hospital-management-system/internal/router"
)

func main() {
	config.LoadConfig()

	dao.InitDB()
	dao.AutoMigrate()

	r := router.SetupRouter()

	addr := fmt.Sprintf(":%d", config.AppConfig.Server.Port)
	log.Printf("服务器启动在 %s", addr)

	if err := r.Run(addr); err != nil {
		log.Fatalf("启动服务器失败: %v", err)
	}
}
