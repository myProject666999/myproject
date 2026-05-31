package service

import (
	"errors"
	"fmt"
	"math/rand"
	"time"

	"gorm.io/gorm"

	"online-knowledge-paid/model"
)

type OrderService struct{}

func (s *OrderService) CreateOrder(db *gorm.DB, userID, columnID uint64, amount float64) (*model.Order, error) {
	orderNo := fmt.Sprintf("%d%d", time.Now().Unix(), rand.Intn(9000)+1000)

	order := &model.Order{
		OrderNo:  orderNo,
		UserID:   userID,
		ColumnID: columnID,
		Amount:   amount,
	}

	if err := db.Create(order).Error; err != nil {
		return nil, err
	}
	return order, nil
}

func (s *OrderService) PayOrder(db *gorm.DB, orderID uint64, payMethod string) (*model.Order, error) {
	var order model.Order
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&order, orderID).Error; err != nil {
			return err
		}
		if order.Status != 0 {
			return errors.New("order already processed")
		}

		now := time.Now()
		order.Status = 1
		order.PayMethod = payMethod
		order.PaidAt = &now
		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		subscription := &model.Subscription{
			UserID:    order.UserID,
			ColumnID:  order.ColumnID,
			OrderID:   order.ID,
			Status:    1,
			StartDate: now,
			EndDate:   now.AddDate(0, 1, 0),
		}
		if err := tx.Create(subscription).Error; err != nil {
			return err
		}

		if err := tx.Model(&model.Column{}).Where("id = ?", order.ColumnID).UpdateColumn("subscriber_count", gorm.Expr("subscriber_count + ?", 1)).Error; err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (s *OrderService) GetOrderByID(db *gorm.DB, id uint64) (*model.Order, error) {
	var order model.Order
	if err := db.First(&order, id).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

func (s *OrderService) GetOrderByOrderNo(db *gorm.DB, orderNo string) (*model.Order, error) {
	var order model.Order
	if err := db.Where("order_no = ?", orderNo).First(&order).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

func (s *OrderService) GetOrdersByUser(db *gorm.DB, userID uint64, page, pageSize int) ([]model.Order, int64, error) {
	var orders []model.Order
	var total int64

	offset := (page - 1) * pageSize

	db.Model(&model.Order{}).Where("user_id = ?", userID).Count(&total)

	if err := db.Preload("Column").
		Where("user_id = ?", userID).
		Offset(offset).Limit(pageSize).
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		return nil, 0, err
	}
	return orders, total, nil
}