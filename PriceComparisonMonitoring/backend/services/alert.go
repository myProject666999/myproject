package services

import (
	"fmt"
	"log"
	"price-monitor/database"
	"price-monitor/models"
	"strings"
	"time"
)

type AlertService struct{}

func NewAlertService() *AlertService {
	return &AlertService{}
}

func (s *AlertService) CheckAndSendAlerts(product *models.Product, oldPrice, newPrice *float64) {
	var alerts []models.AlertSetting
	database.DB.Where("product_id = ? AND status = ?", product.ID, 1).Find(&alerts)

	for _, alert := range alerts {
		shouldAlert := false
		var message string

		switch alert.AlertType {
		case "price_drop":
			shouldAlert, message = s.checkPriceDrop(alert, oldPrice, newPrice, product)
		case "below_threshold":
			shouldAlert, message = s.checkBelowThreshold(alert, newPrice, product)
		case "daily":
			shouldAlert, message = s.checkDailyAlert(alert, newPrice, product)
		case "weekly":
			shouldAlert, message = s.checkWeeklyAlert(alert, newPrice, product)
		}

		if shouldAlert {
			s.createAlertLog(product, &alert, oldPrice, newPrice, message)
		}
	}
}

func (s *AlertService) checkPriceDrop(alert models.AlertSetting, oldPrice, newPrice *float64, product *models.Product) (bool, string) {
	if oldPrice == nil || newPrice == nil {
		return false, ""
	}

	if *newPrice >= *oldPrice {
		return false, ""
	}

	changeAmount := *oldPrice - *newPrice
	changePercent := (changeAmount / *oldPrice) * 100

	if alert.ThresholdPercent != nil && changePercent < *alert.ThresholdPercent {
		return false, ""
	}

	message := fmt.Sprintf("商品「%s」价格下降了 ¥%.2f (%.1f%%)，当前价格 ¥%.2f",
		product.Title, changeAmount, changePercent, *newPrice)

	return true, message
}

func (s *AlertService) checkBelowThreshold(alert models.AlertSetting, newPrice *float64, product *models.Product) (bool, string) {
	if newPrice == nil || alert.ThresholdPrice == nil {
		return false, ""
	}

	if *newPrice > *alert.ThresholdPrice {
		return false, ""
	}

	message := fmt.Sprintf("商品「%s」当前价格 ¥%.2f 已低于设定阈值 ¥%.2f",
		product.Title, *newPrice, *alert.ThresholdPrice)

	return true, message
}

func (s *AlertService) checkDailyAlert(alert models.AlertSetting, newPrice *float64, product *models.Product) (bool, string) {
	if newPrice == nil {
		return false, ""
	}

	var lastLog models.AlertLog
	database.DB.Where("product_id = ? AND alert_type = ?", product.ID, "daily").
		Order("created_at DESC").First(&lastLog)

	if lastLog.ID != 0 && time.Since(lastLog.CreatedAt) < 24*time.Hour {
		return false, ""
	}

	message := fmt.Sprintf("每日价格提醒：商品「%s」当前价格 ¥%.2f", product.Title, *newPrice)
	return true, message
}

func (s *AlertService) checkWeeklyAlert(alert models.AlertSetting, newPrice *float64, product *models.Product) (bool, string) {
	if newPrice == nil {
		return false, ""
	}

	var lastLog models.AlertLog
	database.DB.Where("product_id = ? AND alert_type = ?", product.ID, "weekly").
		Order("created_at DESC").First(&lastLog)

	if lastLog.ID != 0 && time.Since(lastLog.CreatedAt) < 7*24*time.Hour {
		return false, ""
	}

	message := fmt.Sprintf("每周价格提醒：商品「%s」当前价格 ¥%.2f", product.Title, *newPrice)
	return true, message
}

func (s *AlertService) createAlertLog(product *models.Product, alert *models.AlertSetting, oldPrice, newPrice *float64, message string) {
	var changeAmount, changePercent *float64

	if oldPrice != nil && newPrice != nil {
		amount := *oldPrice - *newPrice
		if *oldPrice > 0 {
			percent := (amount / *oldPrice) * 100
			changePercent = &percent
		}
		changeAmount = &amount
	}

	channels := s.getNotifyChannels(alert)

	alertLog := models.AlertLog{
		UserID:         product.UserID,
		ProductID:      product.ID,
		AlertType:      alert.AlertType,
		OldPrice:       oldPrice,
		NewPrice:       newPrice,
		ChangeAmount:   changeAmount,
		ChangePercent:  changePercent,
		Message:        message,
		NotifyChannels: channels,
		IsRead:         0,
	}

	if err := database.DB.Create(&alertLog).Error; err != nil {
		log.Printf("Failed to create alert log: %v", err)
		return
	}

	s.sendNotifications(product, alert, message)
}

func (s *AlertService) getNotifyChannels(alert *models.AlertSetting) string {
	var channels []string

	if alert.NotifyEmail == 1 {
		channels = append(channels, "email")
	}
	if alert.NotifySMS == 1 {
		channels = append(channels, "sms")
	}
	if alert.NotifyWechat == 1 {
		channels = append(channels, "wechat")
	}
	if alert.NotifyWebpush == 1 {
		channels = append(channels, "webpush")
	}

	return strings.Join(channels, ",")
}

func (s *AlertService) sendNotifications(product *models.Product, alert *models.AlertSetting, message string) {
	if alert.NotifyEmail == 1 {
		s.sendEmailNotification(product, message)
	}

	if alert.NotifyWebpush == 1 {
		s.sendWebPushNotification(product, message)
	}
}

func (s *AlertService) sendEmailNotification(product *models.Product, message string) {
	var user models.User
	database.DB.First(&user, product.UserID)

	if user.Email == "" {
		log.Printf("User %d has no email configured", product.UserID)
		return
	}

	log.Printf("Email notification sent to %s: %s", user.Email, message)
}

func (s *AlertService) sendWebPushNotification(product *models.Product, message string) {
	log.Printf("Web push notification for product %d: %s", product.ID, message)
}

func (s *AlertService) GetUserAlerts(userID uint64) ([]models.AlertLog, error) {
	var logs []models.AlertLog
	err := database.DB.Where("user_id = ?", userID).Order("created_at DESC").Limit(50).Find(&logs).Error
	return logs, err
}

func (s *AlertService) MarkAlertAsRead(alertID uint64) error {
	return database.DB.Model(&models.AlertLog{}).Where("id = ?", alertID).Update("is_read", 1).Error
}

func (s *AlertService) MarkAllAlertsAsRead(userID uint64) error {
	return database.DB.Model(&models.AlertLog{}).
		Where("user_id = ? AND is_read = ?", userID, 0).
		Update("is_read", 1).Error
}

func (s *AlertService) GetUnreadAlertCount(userID uint64) (int64, error) {
	var count int64
	err := database.DB.Model(&models.AlertLog{}).
		Where("user_id = ? AND is_read = ?", userID, 0).
		Count(&count).Error
	return count, err
}
