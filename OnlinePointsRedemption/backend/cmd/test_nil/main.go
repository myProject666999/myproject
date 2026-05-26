package main

import (
	"fmt"
	"net/http/httptest"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"

	"github.com/onlinemall/backend/internal/handler"
	"github.com/onlinemall/backend/internal/repository"
	"github.com/onlinemall/backend/internal/router"
	"github.com/onlinemall/backend/internal/service"
)

func main() {
	gin.SetMode(gin.TestMode)

	var db *gorm.DB
	var rdb *redis.Client

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

	req := httptest.NewRequest("GET", "/api/products", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	fmt.Printf("Status: %d\n", w.Code)
	fmt.Printf("Body: %s\n", w.Body.String())

	req2 := httptest.NewRequest("GET", "/api/health", nil)
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)

	fmt.Printf("Health Status: %d\n", w2.Code)
	fmt.Printf("Health Body: %s\n", w2.Body.String())
}
