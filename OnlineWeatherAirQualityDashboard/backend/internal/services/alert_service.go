package services

import (
	"time"

	"air-quality-dashboard/internal/database"
	"air-quality-dashboard/internal/models"
)

type AlertService struct{}

func NewAlertService() *AlertService {
	return &AlertService{}
}

func (s *AlertService) GetActiveAlerts() ([]models.Alert, error) {
	var alerts []models.Alert
	err := database.DB.Where("is_resolved = ?", 0).
		Preload("City").
		Order("created_at DESC").
		Find(&alerts).Error
	return alerts, err
}

func (s *AlertService) GetAlertsByCity(cityID int, limit int) ([]models.Alert, error) {
	var alerts []models.Alert
	err := database.DB.Where("city_id = ?", cityID).
		Preload("City").
		Order("created_at DESC").
		Limit(limit).
		Find(&alerts).Error
	return alerts, err
}

func (s *AlertService) GetAllAlerts(limit, offset int) ([]models.Alert, int64, error) {
	var alerts []models.Alert
	var total int64

	database.DB.Model(&models.Alert{}).Count(&total)
	err := database.DB.Preload("City").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&alerts).Error

	return alerts, total, err
}

func (s *AlertService) CreateAlert(alert *models.Alert) error {
	var existing models.Alert
	result := database.DB.Where("city_id = ? AND alert_type = ? AND is_resolved = ?",
		alert.CityID, alert.AlertType, 0).First(&existing)

	if result.Error == nil {
		existing.CurrentValue = alert.CurrentValue
		existing.Message = alert.Message
		existing.UpdatedAt = time.Now()
		return database.DB.Save(&existing).Error
	}

	return database.DB.Create(alert).Error
}

func (s *AlertService) ResolveAlert(id int64) error {
	now := time.Now()
	return database.DB.Model(&models.Alert{}).Where("id = ?", id).
		Updates(map[string]interface{}{
			"is_resolved": 1,
			"end_time":    now,
		}).Error
}

func (s *AlertService) CheckAndCreateAlerts(cityID int, aqi int, pm25 float64) error {
	warningThreshold := 150
	dangerThreshold := 200

	if aqi >= dangerThreshold {
		alert := &models.Alert{
			CityID:         cityID,
			AlertType:      "AQI",
			AlertLevel:     "红色",
			ThresholdValue: dangerThreshold,
			CurrentValue:   aqi,
			Message:        "AQI严重超标，属于严重污染，建议所有人群减少户外活动",
			IsResolved:     0,
			StartTime:      time.Now(),
		}
		return s.CreateAlert(alert)
	} else if aqi >= warningThreshold {
		alert := &models.Alert{
			CityID:         cityID,
			AlertType:      "AQI",
			AlertLevel:     "橙色",
			ThresholdValue: warningThreshold,
			CurrentValue:   aqi,
			Message:        "AQI偏高，属于中度污染，敏感人群应减少户外活动",
			IsResolved:     0,
			StartTime:      time.Now(),
		}
		return s.CreateAlert(alert)
	}

	pm25Threshold := 115.0
	if pm25 >= pm25Threshold {
		alert := &models.Alert{
			CityID:         cityID,
			AlertType:      "PM2.5",
			AlertLevel:     "黄色",
			ThresholdValue: int(pm25Threshold),
			CurrentValue:   int(pm25),
			Message:        "PM2.5浓度超标，请注意防护",
			IsResolved:     0,
			StartTime:      time.Now(),
		}
		return s.CreateAlert(alert)
	}

	return nil
}
