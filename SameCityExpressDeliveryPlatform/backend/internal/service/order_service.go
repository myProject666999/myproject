package service

import (
	"errors"
	"time"

	"samecity-express/config"
	"samecity-express/internal/model"
	"samecity-express/pkg/utils"
)

type OrderService struct {
	userService  *UserService
	riderService *RiderService
}

func NewOrderService() *OrderService {
	return &OrderService{
		userService:  NewUserService(),
		riderService: NewRiderService(),
	}
}

func (s *OrderService) CalculatePrice(req *CalculatePriceRequest) (*PriceResult, error) {
	distance := utils.CalculateDistance(
		req.PickupLatitude, req.PickupLongitude,
		req.DeliveryLatitude, req.DeliveryLongitude,
	)

	var rule model.PricingRule
	err := config.DB.Where("is_enabled = ?", true).
		Order("priority DESC").
		First(&rule).Error
	if err != nil {
		return nil, errors.New("计费规则获取失败")
	}

	basePrice := rule.BasePrice
	distancePrice := 0.0
	if distance > rule.BaseDistance {
		distancePrice = (distance - rule.BaseDistance) * rule.DistancePrice
	}

	weightPrice := 0.0
	if req.Weight > rule.BaseWeight {
		weightPrice = (req.Weight - rule.BaseWeight) * rule.WeightPrice
	}

	timeSurcharge := 0.0
	if utils.IsPeakTime() || utils.IsNightTime() {
		timeSurcharge = rule.TimeSurcharge
	}

	totalPrice := basePrice + distancePrice + weightPrice + timeSurcharge
	platformFee := totalPrice * 0.2
	riderIncome := totalPrice - platformFee

	estimatedTime := utils.CalculateEstimatedTime(distance)

	return &PriceResult{
		Distance:      distance,
		BasePrice:     basePrice,
		DistancePrice: distancePrice,
		WeightPrice:   weightPrice,
		TimeSurcharge: timeSurcharge,
		TotalPrice:    totalPrice,
		PlatformFee:   platformFee,
		RiderIncome:   riderIncome,
		EstimatedTime: estimatedTime,
	}, nil
}

type CalculatePriceRequest struct {
	PickupLongitude   float64
	PickupLatitude    float64
	DeliveryLongitude float64
	DeliveryLatitude  float64
	Weight            float64
}

type PriceResult struct {
	Distance      float64
	BasePrice     float64
	DistancePrice float64
	WeightPrice   float64
	TimeSurcharge float64
	TotalPrice    float64
	PlatformFee   float64
	RiderIncome   float64
	EstimatedTime int
}

func (s *OrderService) CreateOrder(userID uint, req *CreateOrderRequest) (*model.Order, error) {
	priceReq := &CalculatePriceRequest{
		PickupLongitude:   req.PickupLongitude,
		PickupLatitude:    req.PickupLatitude,
		DeliveryLongitude: req.DeliveryLongitude,
		DeliveryLatitude:  req.DeliveryLatitude,
		Weight:            req.Weight,
	}

	priceResult, err := s.CalculatePrice(priceReq)
	if err != nil {
		return nil, err
	}

	user, err := s.userService.GetUserByID(userID)
	if err != nil {
		return nil, errors.New("用户不存在")
	}

	if user.Balance < priceResult.TotalPrice {
		return nil, errors.New("余额不足")
	}

	signCode := utils.GenerateSignCode()

	order := &model.Order{
		OrderNo:           utils.GenerateOrderNo(),
		UserID:            userID,
		PickupName:        req.PickupName,
		PickupPhone:       req.PickupPhone,
		PickupAddress:     req.PickupAddress,
		PickupLongitude:   req.PickupLongitude,
		PickupLatitude:    req.PickupLatitude,
		DeliveryName:      req.DeliveryName,
		DeliveryPhone:     req.DeliveryPhone,
		DeliveryAddress:   req.DeliveryAddress,
		DeliveryLongitude: req.DeliveryLongitude,
		DeliveryLatitude:  req.DeliveryLatitude,
		ItemType:          req.ItemType,
		ItemName:          req.ItemName,
		ItemWeight:        req.Weight,
		ItemValue:         req.ItemValue,
		ItemQuantity:      req.Quantity,
		Remark:            req.Remark,
		RequireTime:       req.RequireTime,
		Distance:          priceResult.Distance,
		EstimatedTime:     priceResult.EstimatedTime,
		BasePrice:         priceResult.BasePrice,
		DistancePrice:     priceResult.DistancePrice,
		WeightPrice:       priceResult.WeightPrice,
		TimeSurcharge:     priceResult.TimeSurcharge,
		TotalPrice:        priceResult.TotalPrice,
		PlatformFee:       priceResult.PlatformFee,
		RiderIncome:       priceResult.RiderIncome,
		Status:            0,
		SignCode:          signCode,
	}

	tx := config.DB.Begin()

	if err := tx.Create(order).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Model(user).Update("balance", user.Balance-priceResult.TotalPrice).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	walletRecord := &model.WalletRecord{
		UserID:      userID,
		Type:        2,
		Amount:      -priceResult.TotalPrice,
		Balance:     user.Balance - priceResult.TotalPrice,
		Description: "下单支付",
		OrderID:     order.ID,
	}
	if err := tx.Create(walletRecord).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	orderTrack := &model.OrderTrack{
		OrderID: order.ID,
		Status:  0,
		Content: "订单已创建，等待骑手接单",
	}
	if err := tx.Create(orderTrack).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	tx.Commit()

	return order, nil
}

type CreateOrderRequest struct {
	PickupName        string
	PickupPhone       string
	PickupAddress     string
	PickupLongitude   float64
	PickupLatitude    float64
	DeliveryName      string
	DeliveryPhone     string
	DeliveryAddress   string
	DeliveryLongitude float64
	DeliveryLatitude  float64
	ItemType          int
	ItemName          string
	Weight            float64
	ItemValue         float64
	Quantity          int
	Remark            string
	RequireTime       time.Time
}

func (s *OrderService) AcceptOrder(riderID uint, orderID uint) (*model.Order, error) {
	tx := config.DB.Begin()

	var order model.Order
	if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&order, orderID).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("订单不存在")
	}

	if order.Status != 0 {
		tx.Rollback()
		return nil, errors.New("订单已被接单或已取消")
	}

	now := time.Now()
	order.RiderID = riderID
	order.Status = 1
	order.PickupTime = &now

	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Model(&model.Rider{}).Where("id = ?", riderID).Update("online_status", 2).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	orderTrack := &model.OrderTrack{
		OrderID: order.ID,
		Status:  1,
		Content: "骑手已接单，正在前往取件",
	}
	if err := tx.Create(orderTrack).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	tx.Commit()

	return &order, nil
}

func (s *OrderService) PickupOrder(riderID uint, orderID uint, pickupPhoto string) (*model.Order, error) {
	var order model.Order
	if err := config.DB.First(&order, orderID).Error; err != nil {
		return nil, errors.New("订单不存在")
	}

	if order.RiderID != riderID {
		return nil, errors.New("无权操作此订单")
	}

	if order.Status != 1 && order.Status != 2 {
		return nil, errors.New("订单状态不正确")
	}

	now := time.Now()
	order.Status = 3
	order.PickupTime = &now
	order.PickupPhoto = pickupPhoto

	if err := config.DB.Save(&order).Error; err != nil {
		return nil, err
	}

	orderTrack := &model.OrderTrack{
		OrderID: order.ID,
		Status:  3,
		Content: "骑手已取件，正在配送",
	}
	config.DB.Create(orderTrack)

	return &order, nil
}

func (s *OrderService) DeliverOrder(riderID uint, orderID uint, signCode, deliveryPhoto string) (*model.Order, error) {
	var order model.Order
	if err := config.DB.First(&order, orderID).Error; err != nil {
		return nil, errors.New("订单不存在")
	}

	if order.RiderID != riderID {
		return nil, errors.New("无权操作此订单")
	}

	if order.Status != 4 {
		return nil, errors.New("订单状态不正确")
	}

	if order.SignCode != signCode {
		return nil, errors.New("签收码错误")
	}

	tx := config.DB.Begin()

	now := time.Now()
	order.Status = 6
	order.DeliverTime = &now
	order.CompleteTime = &now
	order.DeliveryPhoto = deliveryPhoto

	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	var rider model.Rider
	if err := tx.First(&rider, riderID).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	newBalance := rider.Balance + order.RiderIncome
	newIncome := rider.Income + order.RiderIncome
	newOrderCount := rider.OrderCount + 1
	newCompleteCount := rider.CompleteCount + 1

	if err := tx.Model(&rider).Updates(map[string]interface{}{
		"balance":        newBalance,
		"income":         newIncome,
		"order_count":    newOrderCount,
		"complete_count": newCompleteCount,
		"online_status":  1,
	}).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	riderWallet := &model.WalletRecord{
		RiderID:     riderID,
		Type:        1,
		Amount:      order.RiderIncome,
		Balance:     newBalance,
		Description: "订单配送收入",
		OrderID:     order.ID,
	}
	if err := tx.Create(riderWallet).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	orderTrack := &model.OrderTrack{
		OrderID: order.ID,
		Status:  6,
		Content: "订单已完成，收件人已签收",
	}
	if err := tx.Create(orderTrack).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	tx.Commit()

	return &order, nil
}

func (s *OrderService) CancelOrder(userID uint, orderID uint, reason string) (*model.Order, error) {
	var order model.Order
	if err := config.DB.First(&order, orderID).Error; err != nil {
		return nil, errors.New("订单不存在")
	}

	if order.UserID != userID {
		return nil, errors.New("无权操作此订单")
	}

	if order.Status >= 1 {
		return nil, errors.New("订单已被接单，无法取消")
	}

	tx := config.DB.Begin()

	now := time.Now()
	order.Status = 7
	order.CancelTime = &now
	order.CancelReason = reason

	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	var user model.User
	if err := tx.First(&user, userID).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	newBalance := user.Balance + order.TotalPrice
	if err := tx.Model(&user).Update("balance", newBalance).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	userWallet := &model.WalletRecord{
		UserID:      userID,
		Type:        3,
		Amount:      order.TotalPrice,
		Balance:     newBalance,
		Description: "订单取消退款",
		OrderID:     order.ID,
	}
	if err := tx.Create(userWallet).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	orderTrack := &model.OrderTrack{
		OrderID: order.ID,
		Status:  7,
		Content: "订单已取消，原因：" + reason,
	}
	if err := tx.Create(orderTrack).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	tx.Commit()

	return &order, nil
}

func (s *OrderService) GetOrderByID(orderID uint) (*model.Order, error) {
	var order model.Order
	if err := config.DB.Preload("User").Preload("Rider").First(&order, orderID).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

func (s *OrderService) GetUserOrders(userID uint, status *int, page, pageSize int) ([]*model.Order, int64, error) {
	var orders []*model.Order
	var total int64

	query := config.DB.Model(&model.Order{}).Where("user_id = ?", userID)
	if status != nil {
		query = query.Where("status = ?", *status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Preload("Rider").Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}

func (s *OrderService) GetRiderOrders(riderID uint, status *int, page, pageSize int) ([]*model.Order, int64, error) {
	var orders []*model.Order
	var total int64

	query := config.DB.Model(&model.Order{}).Where("rider_id = ?", riderID)
	if status != nil {
		query = query.Where("status = ?", *status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Preload("User").Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}

func (s *OrderService) GetAvailableOrders(riderID uint, longitude, latitude float64, page, pageSize int) ([]*model.Order, int64, error) {
	var orders []*model.Order
	var total int64

	query := config.DB.Model(&model.Order{}).Where("status = 0")

	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Preload("User").Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	for _, order := range orders {
		order.Distance = utils.CalculateDistance(
			latitude, longitude,
			order.PickupLatitude, order.PickupLongitude,
		)
	}

	return orders, total, nil
}

func (s *OrderService) GetOrderTracks(orderID uint) ([]*model.OrderTrack, error) {
	var tracks []*model.OrderTrack
	if err := config.DB.Where("order_id = ?", orderID).Order("created_at ASC").Find(&tracks).Error; err != nil {
		return nil, err
	}
	return tracks, nil
}

func (s *OrderService) RateOrder(userID uint, orderID uint, rating int, comment string) (*model.Order, error) {
	var order model.Order
	if err := config.DB.First(&order, orderID).Error; err != nil {
		return nil, errors.New("订单不存在")
	}

	if order.UserID != userID {
		return nil, errors.New("无权操作此订单")
	}

	if order.Status != 6 {
		return nil, errors.New("订单未完成，无法评价")
	}

	if order.Rating > 0 {
		return nil, errors.New("订单已评价")
	}

	tx := config.DB.Begin()

	now := time.Now()
	order.Rating = rating
	order.Comment = comment
	order.RatingTime = &now

	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := s.riderService.UpdateRating(order.RiderID, rating); err != nil {
		tx.Rollback()
		return nil, err
	}

	tx.Commit()

	return &order, nil
}
