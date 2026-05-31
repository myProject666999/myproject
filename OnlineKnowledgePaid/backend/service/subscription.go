package service

import (
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"

	"online-knowledge-paid/model"
	redisclient "online-knowledge-paid/pkg/redis"
)

type SubscriptionService struct{}

func (s *SubscriptionService) CreateSubscription(db *gorm.DB, sub *model.Subscription) error {
	err := db.Create(sub).Error
	if err == nil {
		client := redisclient.GetClient()
		if client != nil {
			key := fmt.Sprintf("subscription:%d:%d", sub.UserID, sub.ColumnID)
			_ = client.Set(context.Background(), key, "1", 24*time.Hour).Err()
		}
	}
	return err
}

func (s *SubscriptionService) CheckSubscription(db *gorm.DB, userID, columnID uint64) (bool, error) {
	client := redisclient.GetClient()
	if client != nil {
		key := fmt.Sprintf("subscription:%d:%d", userID, columnID)
		val, err := client.Get(context.Background(), key).Result()
		if err == nil && val == "1" {
			return true, nil
		}
	}

	var subscription model.Subscription
	now := time.Now()
	err := db.Where("user_id = ? AND column_id = ? AND status = ? AND end_date >= ?", userID, columnID, 1, now).
		First(&subscription).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, err
	}

	if client != nil {
		key := fmt.Sprintf("subscription:%d:%d", userID, columnID)
		ttl := time.Until(subscription.EndDate)
		if ttl > 24*time.Hour {
			ttl = 24 * time.Hour
		}
		if ttl > 0 {
			_ = client.Set(context.Background(), key, "1", ttl).Err()
		}
	}

	return true, nil
}

func (s *SubscriptionService) GetSubscriptionsByUser(db *gorm.DB, userID uint64, page, pageSize int) ([]model.Subscription, int64, error) {
	var subscriptions []model.Subscription
	var total int64

	offset := (page - 1) * pageSize

	db.Model(&model.Subscription{}).Where("user_id = ?", userID).Count(&total)

	if err := db.Preload("Column").Preload("Column.Author").
		Where("user_id = ?", userID).
		Offset(offset).Limit(pageSize).
		Order("created_at DESC").
		Find(&subscriptions).Error; err != nil {
		return nil, 0, err
	}
	return subscriptions, total, nil
}

func (s *SubscriptionService) GetSubscriptionsByColumn(db *gorm.DB, columnID uint64, page, pageSize int) ([]model.Subscription, int64, error) {
	var subscriptions []model.Subscription
	var total int64

	offset := (page - 1) * pageSize

	db.Model(&model.Subscription{}).Where("column_id = ?", columnID).Count(&total)

	if err := db.Preload("User").
		Where("column_id = ?", columnID).
		Offset(offset).Limit(pageSize).
		Order("created_at DESC").
		Find(&subscriptions).Error; err != nil {
		return nil, 0, err
	}
	return subscriptions, total, nil
}
