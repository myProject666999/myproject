package service

import (
	"carpooling/internal/model"
	"carpooling/pkg/database"
	redisPkg "carpooling/pkg/redis"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

var lockSeatsScript = redis.NewScript(`
local seats = redis.call('GET', KEYS[1])
if seats and tonumber(seats) >= tonumber(ARGV[1]) then
    redis.call('DECRBY', KEYS[1], ARGV[1])
    return 1
end
return 0
`)

type OrderService struct{}

func NewOrderService() *OrderService {
	return &OrderService{}
}

func (s *OrderService) lockSeats(rideID uint64, count int) (bool, error) {
	key := fmt.Sprintf("ride:seats:%d", rideID)
	rdb := redisPkg.Client
	ctx := redisPkg.Ctx

	exists, err := rdb.Exists(ctx, key).Result()
	if err != nil {
		return false, err
	}
	if exists == 0 {
		var ride model.Ride
		if err := database.GetDB().First(&ride, rideID).Error; err != nil {
			return false, fmt.Errorf("行程不存在")
		}
		available := ride.AvailableSeats - ride.LockedSeats
		rdb.Set(ctx, key, available, 0)
	}

	result, err := lockSeatsScript.Run(ctx, rdb, []string{key}, count).Int64()
	if err != nil {
		return false, err
	}
	return result == 1, nil
}

func (s *OrderService) releaseSeats(rideID uint64, count int) error {
	key := fmt.Sprintf("ride:seats:%d", rideID)
	_, err := redisPkg.Client.IncrBy(redisPkg.Ctx, key, int64(count)).Result()
	if err != nil {
		return err
	}
	return database.GetDB().Model(&model.Ride{}).Where("id = ?", rideID).
		Update("locked_seats", gorm.Expr("locked_seats - ?", count)).Error
}

func (s *OrderService) CreateOrder(userID uint64, req *model.CreateOrderRequest) (*model.Order, error) {
	db := database.GetDB()

	var ride model.Ride
	if err := db.First(&ride, req.RideID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("行程不存在")
		}
		return nil, err
	}

	if ride.Status != 1 {
		return nil, fmt.Errorf("行程不在招募中")
	}

	available := ride.AvailableSeats - ride.LockedSeats
	if available < req.PassengersCount {
		return nil, fmt.Errorf("可用座位不足")
	}

	locked, err := s.lockSeats(ride.ID, req.PassengersCount)
	if err != nil {
		return nil, fmt.Errorf("锁定座位失败: %v", err)
	}
	if !locked {
		return nil, fmt.Errorf("座位已被抢完")
	}

	order := model.Order{
		RideID:          req.RideID,
		RequestID:       req.RequestID,
		OwnerID:         ride.OwnerID,
		PassengerID:     userID,
		PassengersCount: req.PassengersCount,
		Price:           ride.PricePerPerson * float64(req.PassengersCount),
		PickupAddress:   req.PickupAddress,
		DropoffAddress:  req.DropoffAddress,
		Status:          model.OrderStatusPending,
	}

	if err := db.Create(&order).Error; err != nil {
		s.releaseSeats(ride.ID, req.PassengersCount)
		return nil, fmt.Errorf("创建订单失败")
	}

	db.Model(&model.Ride{}).Where("id = ?", ride.ID).
		Update("locked_seats", gorm.Expr("locked_seats + ?", req.PassengersCount))

	var result model.Order
	if err := db.Preload("Ride").Preload("Owner").Preload("Passenger").First(&result, order.ID).Error; err != nil {
		return nil, err
	}

	return &result, nil
}

func (s *OrderService) ConfirmOrder(orderID, ownerID uint64) error {
	db := database.GetDB()

	var order model.Order
	if err := db.First(&order, orderID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("订单不存在")
		}
		return err
	}

	if order.OwnerID != ownerID {
		return fmt.Errorf("无权操作此订单")
	}

	if order.Status != model.OrderStatusPending {
		return fmt.Errorf("订单状态不允许确认")
	}

	now := time.Now()
	return db.Model(&order).Updates(map[string]interface{}{
		"status":            model.OrderStatusConfirmed,
		"owner_confirm_time": now,
	}).Error
}

func (s *OrderService) RejectOrder(orderID, ownerID uint64) error {
	db := database.GetDB()

	var order model.Order
	if err := db.First(&order, orderID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("订单不存在")
		}
		return err
	}

	if order.OwnerID != ownerID {
		return fmt.Errorf("无权操作此订单")
	}

	if order.Status != model.OrderStatusPending {
		return fmt.Errorf("订单状态不允许拒绝")
	}

	if err := db.Model(&order).Update("status", model.OrderStatusRejected).Error; err != nil {
		return err
	}

	return s.releaseSeats(order.RideID, order.PassengersCount)
}

func (s *OrderService) StartOrder(orderID, ownerID uint64) error {
	db := database.GetDB()

	var order model.Order
	if err := db.First(&order, orderID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("订单不存在")
		}
		return err
	}

	if order.OwnerID != ownerID {
		return fmt.Errorf("无权操作此订单")
	}

	if order.Status != model.OrderStatusConfirmed {
		return fmt.Errorf("订单状态不允许出发")
	}

	now := time.Now()
	if err := db.Model(&order).Updates(map[string]interface{}{
		"status":     model.OrderStatusStarted,
		"start_time": now,
	}).Error; err != nil {
		return err
	}

	return db.Model(&model.Ride{}).Where("id = ?", order.RideID).Update("status", 2).Error
}

func (s *OrderService) CompleteOrder(orderID, userID uint64) error {
	db := database.GetDB()

	var order model.Order
	if err := db.First(&order, orderID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("订单不存在")
		}
		return err
	}

	if order.OwnerID != userID && order.PassengerID != userID {
		return fmt.Errorf("无权操作此订单")
	}

	if order.Status != model.OrderStatusStarted {
		return fmt.Errorf("订单状态不允许完成")
	}

	now := time.Now()
	if err := db.Model(&order).Updates(map[string]interface{}{
		"status":        model.OrderStatusCompleted,
		"complete_time": now,
	}).Error; err != nil {
		return err
	}

	if err := s.releaseSeats(order.RideID, order.PassengersCount); err != nil {
		return err
	}

	var remainingOrders int64
	db.Model(&model.Order{}).Where("ride_id = ? AND status IN ?", order.RideID,
		[]int{model.OrderStatusPending, model.OrderStatusConfirmed, model.OrderStatusStarted}).Count(&remainingOrders)

	if remainingOrders == 0 {
		db.Model(&model.Ride{}).Where("id = ?", order.RideID).Update("status", 3)
	}

	return nil
}

func (s *OrderService) CancelOrder(orderID, userID uint64, reason string) error {
	db := database.GetDB()

	var order model.Order
	if err := db.First(&order, orderID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("订单不存在")
		}
		return err
	}

	if order.OwnerID != userID && order.PassengerID != userID {
		return fmt.Errorf("无权操作此订单")
	}

	if order.Status != model.OrderStatusPending && order.Status != model.OrderStatusConfirmed {
		return fmt.Errorf("订单状态不允许取消")
	}

	now := time.Now()
	if err := db.Model(&order).Updates(map[string]interface{}{
		"status":        model.OrderStatusCancelled,
		"cancel_time":   now,
		"cancel_reason": reason,
	}).Error; err != nil {
		return err
	}

	return s.releaseSeats(order.RideID, order.PassengersCount)
}

func (s *OrderService) GetOrder(orderID uint64) (*model.Order, error) {
	db := database.GetDB()

	var order model.Order
	if err := db.Preload("Ride").Preload("Owner").Preload("Passenger").First(&order, orderID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("订单不存在")
		}
		return nil, err
	}

	return &order, nil
}

func (s *OrderService) ListOrders(userID uint64, page, pageSize int) ([]model.Order, int64, error) {
	db := database.GetDB()

	var total int64
	var orders []model.Order

	query := db.Model(&model.Order{}).Where("owner_id = ? OR passenger_id = ?", userID, userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Preload("Ride").Preload("Owner").Preload("Passenger").
		Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}
