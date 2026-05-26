package main

import (
	"fmt"
	"log"

	"github.com/onlinemall/backend/internal/config"
	"github.com/onlinemall/backend/internal/handler"
	"github.com/onlinemall/backend/internal/pkg/database"
	redisPkg "github.com/onlinemall/backend/internal/pkg/redis"
	"github.com/onlinemall/backend/internal/repository"
	"github.com/onlinemall/backend/internal/router"
	"github.com/onlinemall/backend/internal/service"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	if err := database.Init(&cfg.MySQL); err != nil {
		log.Printf("[WARNING] MySQL 连接失败: %v，部分功能将不可用", err)
	}

	if err := redisPkg.Init(&cfg.Redis); err != nil {
		log.Printf("[WARNING] Redis 连接失败: %v，缓存和锁功能将降级", err)
	}

	db := database.DB
	rdb := redisPkg.RDB

	userRepo := repository.NewUserRepository(db)
	productRepo := repository.NewProductRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	pointsDetailRepo := repository.NewPointsDetailRepository(db)
	pointsAccountRepo := repository.NewPointsAccountRepository(db)
	pointsRuleRepo := repository.NewPointsRuleRepository(db)
	productStockRepo := repository.NewProductStockRepository(db)
	categoryRepo := repository.NewProductCategoryRepository(db)

	pointsSvc := service.NewPointsService(userRepo, pointsAccountRepo, pointsRuleRepo, pointsDetailRepo, db, rdb)
	productSvc := service.NewProductService(productRepo, productStockRepo, categoryRepo, db, rdb)
	orderSvc := service.NewOrderService(orderRepo, productRepo, userRepo, pointsSvc, productSvc, db, rdb)

	userHandler := handler.NewUserHandler(pointsSvc, productSvc, orderSvc)
	productHandler := handler.NewProductHandler(productSvc)
	orderHandler := handler.NewOrderHandler(orderSvc)
	adminHandler := handler.NewAdminHandler(orderSvc)

	r := router.SetupRouter(userHandler, productHandler, orderHandler, adminHandler)

	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Printf("服务器启动，监听端口: %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}
