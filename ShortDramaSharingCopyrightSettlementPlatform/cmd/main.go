package main

import (
	"fmt"
	"log"
	"short-drama-platform/internal/api"
	"short-drama-platform/internal/config"
	"short-drama-platform/internal/dao"

	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.LoadConfig("configs/config.yaml"); err != nil {
		log.Fatalf("Load config error: %v", err)
	}

	if err := dao.InitDB(); err != nil {
		log.Fatalf("Init database error: %v", err)
	}

	if err := dao.AutoMigrate(); err != nil {
		log.Fatalf("Auto migrate error: %v", err)
	}

	gin.SetMode(config.AppConfig.Server.Mode)
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api.RegisterRoutes(r)
	api.RegisterDramaRoutes(r)
	api.RegisterStakeholderRoutes(r)
	api.RegisterProfitShareRuleRoutes(r)
	api.RegisterDataRoutes(r)
	api.RegisterShareCalculationRoutes(r)
	api.RegisterSettlementRoutes(r)
	api.RegisterReconciliationRoutes(r)
	api.RegisterCopyrightAuthorizationRoutes(r)

	addr := fmt.Sprintf(":%d", config.AppConfig.Server.Port)
	log.Printf("Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Start server error: %v", err)
	}
}
