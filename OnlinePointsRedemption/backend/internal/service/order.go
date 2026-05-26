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

type OrderService struct {
	orderRepo   *repository.OrderRepository
	productRepo *repository.ProductRepository
	userRepo    *repository.UserRepository
	pointsSvc   *PointsService
	productSvc  *ProductService
	db          *gorm.DB
	rdb         *redis.Client
}

func NewOrderService(
	orderRepo *repository.OrderRepository,
	productRepo *repository.ProductRepository,
	userRepo *repository.UserRepository,
	pointsSvc *PointsService,
	productSvc *ProductService,
	db *gorm.DB,
	rdb *redis.Client,
) *OrderService {
	return &OrderService{
		orderRepo:   orderRepo,
		productRepo: productRepo,
		userRepo:    userRepo,
		pointsSvc:   pointsSvc,
		productSvc:  productSvc,
		db:          db,
		rdb:         rdb,
	}
}

func (s *OrderService) checkDB() error {
	if s.db == nil {
		return ErrDBNotConnected
	}
	return nil
}

func (s *OrderService) checkRedis() bool {
	return s.rdb != nil
}

type CreateOrderReq struct {
	UserID           uint64 `json:"user_id"`
	ProductID        uint64 `json:"product_id" binding:"required"`
	Quantity         int32  `json:"quantity" binding:"required,min=1"`
	ConsigneeName    string `json:"consignee_name" binding:"required"`
	ConsigneePhone   string `json:"consignee_phone" binding:"required"`
	ConsigneeAddress string `json:"consignee_address" binding:"required"`
}

func (s *OrderService) CreateOrder(ctx context.Context, req *CreateOrderReq) (*model.RedemptionOrder, error) {
	if err := s.checkDB(); err != nil {
		return nil, err
	}

	product, _, err := s.productSvc.GetProduct(req.ProductID)
	if err != nil {
		return nil, err
	}
	if product.Status != 1 {
		return nil, errors.New("商品已下架")
	}

	totalPoints := product.PointsPrice * req.Quantity

	account, err := s.pointsSvc.GetAccount(req.UserID)
	if err != nil {
		return nil, errors.New("积分账户不存在")
	}
	if account.AvailablePoints < totalPoints {
		return nil, errors.New("积分不足")
	}

	stock, err := s.productSvc.GetStock(req.ProductID)
	if err != nil {
		return nil, errors.New("库存查询失败")
	}
	if stock.AvailableStock < req.Quantity {
		return nil, errors.New("库存不足")
	}

	orderNo := generateOrderNo(req.UserID)

	if err := s.productSvc.DeductStock(ctx, req.ProductID, req.Quantity); err != nil {
		return nil, fmt.Errorf("扣减库存失败: %w", err)
	}

	order := &model.RedemptionOrder{
		OrderNo:          orderNo,
		UserID:           req.UserID,
		ProductID:        req.ProductID,
		ProductName:      product.ProductName,
		ProductImage:     product.ImageURL,
		PointsPrice:      product.PointsPrice,
		Quantity:         req.Quantity,
		TotalPoints:      totalPoints,
		Status:           0,
		ConsigneeName:    req.ConsigneeName,
		ConsigneePhone:   req.ConsigneePhone,
		ConsigneeAddress: req.ConsigneeAddress,
		CreatedAt:        time.Now(),
	}

	if err := s.orderRepo.Create(order); err != nil {
		_ = s.productSvc.RestoreStock(ctx, req.ProductID, req.Quantity)
		return nil, fmt.Errorf("创建订单失败: %w", err)
	}

	remark := fmt.Sprintf("兑换商品: %s x%d", product.ProductName, req.Quantity)
	if err := s.pointsSvc.DeductPoints(ctx, req.UserID, totalPoints, orderNo, remark); err != nil {
		_ = s.productSvc.RestoreStock(ctx, req.ProductID, req.Quantity)
		_ = s.cancelOrder(order.ID, "扣减积分失败")
		return nil, fmt.Errorf("扣减积分失败: %w", err)
	}

	return order, nil
}

func (s *OrderService) GetOrder(id uint64) (*model.RedemptionOrder, error) {
	return s.orderRepo.GetByID(id)
}

func (s *OrderService) GetOrderByNo(orderNo string) (*model.RedemptionOrder, error) {
	return s.orderRepo.GetByOrderNo(orderNo)
}

func (s *OrderService) ListUserOrders(userID uint64, page, pageSize int) ([]model.RedemptionOrder, int64, error) {
	return s.orderRepo.ListByUserID(userID, page, pageSize)
}

func (s *OrderService) ListOrders(page, pageSize int, status int8) ([]model.RedemptionOrder, int64, error) {
	return s.orderRepo.List(page, pageSize, status)
}

type ShipOrderReq struct {
	OrderNo        string `json:"order_no" binding:"required"`
	ExpressNo      string `json:"express_no" binding:"required"`
	ExpressCompany string `json:"express_company" binding:"required"`
}

func (s *OrderService) ShipOrder(req *ShipOrderReq) error {
	if err := s.checkDB(); err != nil {
		return err
	}

	order, err := s.orderRepo.GetByOrderNo(req.OrderNo)
	if err != nil {
		return errors.New("订单不存在")
	}
	if order.Status != 0 {
		return errors.New("订单状态不正确，无法发货")
	}

	now := time.Now()
	order.Status = 1
	order.ExpressNo = req.ExpressNo
	order.ExpressCompany = req.ExpressCompany
	order.ShippedAt = &now

	return s.orderRepo.Update(order)
}

func (s *OrderService) CompleteOrder(orderNo string) error {
	if err := s.checkDB(); err != nil {
		return err
	}

	order, err := s.orderRepo.GetByOrderNo(orderNo)
	if err != nil {
		return errors.New("订单不存在")
	}
	if order.Status != 1 {
		return errors.New("订单状态不正确，无法完成")
	}

	now := time.Now()
	order.Status = 2
	order.CompletedAt = &now

	if err := s.orderRepo.Update(order); err != nil {
		return err
	}

	return s.productSvc.ConfirmStock(context.Background(), order.ProductID, order.Quantity)
}

func (s *OrderService) CancelOrder(ctx context.Context, orderNo, reason string) error {
	if err := s.checkDB(); err != nil {
		return err
	}

	order, err := s.orderRepo.GetByOrderNo(orderNo)
	if err != nil {
		return errors.New("订单不存在")
	}
	if order.Status != 0 && order.Status != 1 {
		return errors.New("订单状态不正确，无法取消")
	}

	if err := s.cancelOrder(order.ID, reason); err != nil {
		return err
	}

	if err := s.productSvc.RestoreStock(ctx, order.ProductID, order.Quantity); err != nil {
		return err
	}

	remark := fmt.Sprintf("取消订单退还: %s", order.ProductName)
	return s.pointsSvc.RefundPoints(ctx, order.UserID, order.TotalPoints, order.OrderNo, remark)
}

func (s *OrderService) cancelOrder(id uint64, reason string) error {
	order, err := s.orderRepo.GetByID(id)
	if err != nil {
		return err
	}

	now := time.Now()
	order.Status = 3
	order.CancelReason = reason
	order.CancelledAt = &now

	return s.orderRepo.Update(order)
}

func generateOrderNo(userID uint64) string {
	now := time.Now()
	return fmt.Sprintf("EX%d%04d%02d%02d%02d%02d%02d%06d",
		userID,
		now.Year(), now.Month(), now.Day(),
		now.Hour(), now.Minute(), now.Second(),
		now.Nanosecond()/1000%1000000,
	)
}

func (s *OrderService) AcquireUserLock(ctx context.Context, userID uint64) (bool, error) {
	if !s.checkRedis() {
		return true, nil
	}
	lockKey := redisPkg.Key("lock", "user", fmt.Sprintf("%d", userID))
	return s.rdb.SetNX(ctx, lockKey, 1, 10*time.Second).Result()
}

func (s *OrderService) ReleaseUserLock(ctx context.Context, userID uint64) error {
	if !s.checkRedis() {
		return nil
	}
	lockKey := redisPkg.Key("lock", "user", fmt.Sprintf("%d", userID))
	return s.rdb.Del(ctx, lockKey).Err()
}
