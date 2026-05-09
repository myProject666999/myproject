package main

import (
	"log"
	"recruithub/config"
	"recruithub/routes"
)

func main() {
	config.InitDB()

	cfg := config.LoadConfig()
	r := routes.SetupRouter()

	log.Printf("Server starting on port " + cfg.Port)
	log.Printf("Default admin: admin/admin123")
	log.Printf("Test users: zhangsan/123456, lisi/123456")
	log.Printf("Test companies: alibaba/123456, tencent/123456")

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
