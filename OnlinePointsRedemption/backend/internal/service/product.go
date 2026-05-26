package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"

	"github.com/onlinemall/backend/internal/model"
	redisPkg "github.com/onlinemall/backend/internal/pkg/redis"
	"github.com/onlinemall/backend/internal/repository"
)

type ProductService struct {
	productRepo *repository.ProductRepository
	stockRepo   *repository.ProductStockRepository
	catRepo     *repository.ProductCategoryRepository
	db          *gorm.DB
	rdb         *redis.Client
}

func NewProductService(
	productRepo *repository.ProductRepository,
	stockRepo *repository.ProductStockRepository,
	catRepo *repository.ProductCategoryRepository,
	db *gorm.DB,
	rdb *redis.Client,
) *ProductService {
	return &ProductService{
		productRepo: productRepo,
		stockRepo:   stockRepo,
		catRepo:     catRepo,
		db:          db,
		rdb:         rdb,
	}
}

func (s *ProductService) checkDB() error {
	if s.db == nil {
		return ErrDBNotConnected
	}
	return nil
}

func (s *ProductService) checkRedis() bool {
	return s.rdb != nil
}

func (s *ProductService) GetProduct(id uint64) (*model.Product, int32, error) {
	product, err := s.productRepo.GetByID(id)
	if err != nil {
		return nil, 0, errors.New("商品不存在")
	}

	stock, _ := s.stockRepo.GetByProductID(id)
	available := int32(0)
	if stock != nil {
		available = stock.AvailableStock
	}

	return product, available, nil
}

func (s *ProductService) ListProducts(page, pageSize int, categoryID uint64) ([]model.Product, int64, error) {
	return s.productRepo.List(page, pageSize, categoryID)
}

func (s *ProductService) ListAllProducts() ([]model.Product, error) {
	return s.productRepo.ListAll()
}

func (s *ProductService) ListCategories() ([]model.ProductCategory, error) {
	return s.catRepo.List()
}

func (s *ProductService) GetStock(productID uint64) (*model.ProductStock, error) {
	return s.stockRepo.GetByProductID(productID)
}

func (s *ProductService) CacheStock(ctx context.Context, productID uint64, stock int32) error {
	if !s.checkRedis() {
		return nil
	}
	key := redisPkg.Key("stock", fmt.Sprintf("%d", productID))
	return s.rdb.Set(ctx, key, stock, 24*time.Hour).Err()
}

func (s *ProductService) GetCachedStock(ctx context.Context, productID uint64) (int32, error) {
	if !s.checkRedis() {
		stock, err := s.stockRepo.GetByProductID(productID)
		if err != nil {
			return 0, err
		}
		return stock.AvailableStock, nil
	}

	key := redisPkg.Key("stock", fmt.Sprintf("%d", productID))
	val, err := s.rdb.Get(ctx, key).Int()
	if err == redis.Nil {
		stock, err := s.stockRepo.GetByProductID(productID)
		if err != nil {
			return 0, err
		}
		_ = s.CacheStock(ctx, productID, stock.AvailableStock)
		return stock.AvailableStock, nil
	}
	return int32(val), err
}

func (s *ProductService) DeductStock(ctx context.Context, productID uint64, quantity int32) error {
	if err := s.checkDB(); err != nil {
		return err
	}
	if quantity <= 0 {
		return errors.New("扣减数量必须大于0")
	}

	if s.checkRedis() {
		stockKey := redisPkg.Key("stock", fmt.Sprintf("%d", productID))
		lockKey := redisPkg.Key("lock", "stock", fmt.Sprintf("%d", productID))

		lock := s.rdb.SetNX(ctx, lockKey, 1, 5*time.Second)
		if !lock.Val() {
			return errors.New("系统繁忙，请稍后再试")
		}
		defer s.rdb.Del(ctx, lockKey)

		currentStock, err := s.GetCachedStock(ctx, productID)
		if err != nil {
			return err
		}

		if currentStock < quantity {
			return errors.New("库存不足")
		}

		newStock := currentStock - quantity
		if err := s.rdb.Set(ctx, stockKey, newStock, 24*time.Hour).Err(); err != nil {
			return err
		}
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		stock, err := s.stockRepo.GetByProductID(productID)
		if err != nil {
			return errors.New("库存记录不存在")
		}

		if stock.AvailableStock < quantity {
			return errors.New("库存不足")
		}

		stock.AvailableStock -= quantity
		stock.FrozenStock += quantity

		return tx.Save(stock).Error
	})
}

func (s *ProductService) RestoreStock(ctx context.Context, productID uint64, quantity int32) error {
	if err := s.checkDB(); err != nil {
		return err
	}
	if quantity <= 0 {
		return errors.New("恢复数量必须大于0")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		stock, err := s.stockRepo.GetByProductID(productID)
		if err != nil {
			return err
		}

		if stock.FrozenStock < quantity {
			quantity = stock.FrozenStock
		}

		stock.FrozenStock -= quantity
		stock.AvailableStock += quantity

		if err := tx.Save(stock).Error; err != nil {
			return err
		}

		if s.checkRedis() {
			stockKey := redisPkg.Key("stock", fmt.Sprintf("%d", productID))
			return s.rdb.IncrBy(ctx, stockKey, int64(quantity)).Err()
		}
		return nil
	})
}

func (s *ProductService) ConfirmStock(ctx context.Context, productID uint64, quantity int32) error {
	if err := s.checkDB(); err != nil {
		return err
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		stock, err := s.stockRepo.GetByProductID(productID)
		if err != nil {
			return err
		}

		if stock.FrozenStock < quantity {
			quantity = stock.FrozenStock
		}

		stock.FrozenStock -= quantity
		stock.TotalStock -= quantity

		return tx.Save(stock).Error
	})
}
