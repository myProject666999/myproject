package services

import (
	"time"

	"air-quality-dashboard/internal/cache"
	"air-quality-dashboard/internal/database"
	"air-quality-dashboard/internal/models"
)

type AQIService struct{}

func NewAQIService() *AQIService {
	return &AQIService{}
}

func (s *AQIService) GetLatestAQIByCity(cityID int) (*models.AQIRecord, error) {
	var record models.AQIRecord
	err := database.DB.Where("city_id = ?", cityID).Order("record_time DESC").Limit(1).First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

func (s *AQIService) GetAQIHistory(cityID int, hours int) ([]models.AQIRecord, error) {
	cacheKey := "aqi:history:" + string(rune(cityID)) + ":" + string(rune(hours))
	var records []models.AQIRecord

	if cache.Cache != nil {
		err := cache.Cache.Get(cacheKey, &records)
		if err == nil && len(records) > 0 {
			return records, nil
		}
	}

	since := time.Now().Add(-time.Duration(hours) * time.Hour)
	err := database.DB.Where("city_id = ? AND record_time >= ?", cityID, since).
		Order("record_time ASC").
		Find(&records).Error

	if cache.Cache != nil && err == nil {
		cache.Cache.Set(cacheKey, records, 10*time.Minute)
	}

	return records, err
}

func (s *AQIService) AddAQIRecord(record *models.AQIRecord) error {
	return database.DB.Create(record).Error
}

func (s *AQIService) GetAllLatestAQI() ([]models.AQIRecord, error) {
	var records []models.AQIRecord
	subQuery := database.DB.Table("aqi_records").
		Select("MAX(id) as id").
		Group("city_id")
	err := database.DB.Where("id IN (?)", subQuery).
		Preload("City").
		Find(&records).Error
	return records, err
}

func (s *AQIService) GetAQILevel(aqi int) string {
	switch {
	case aqi <= 50:
		return "优"
	case aqi <= 100:
		return "良"
	case aqi <= 150:
		return "轻度污染"
	case aqi <= 200:
		return "中度污染"
	case aqi <= 300:
		return "重度污染"
	default:
		return "严重污染"
	}
}

func (s *AQIService) GetAQIColor(aqi int) string {
	switch {
	case aqi <= 50:
		return "#00e400"
	case aqi <= 100:
		return "#ffff00"
	case aqi <= 150:
		return "#ff7e00"
	case aqi <= 200:
		return "#ff0000"
	case aqi <= 300:
		return "#8f3f97"
	default:
		return "#7e0023"
	}
}
