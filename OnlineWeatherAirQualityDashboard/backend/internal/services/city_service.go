package services

import (
	"time"

	"air-quality-dashboard/internal/cache"
	"air-quality-dashboard/internal/database"
	"air-quality-dashboard/internal/models"
)

type CityService struct{}

func NewCityService() *CityService {
	return &CityService{}
}

func (s *CityService) GetAllCities() ([]models.City, error) {
	var cities []models.City
	err := database.DB.Where("is_monitored = ?", 1).Order("name").Find(&cities).Error
	return cities, err
}

func (s *CityService) GetCityByID(id int) (*models.City, error) {
	var city models.City
	err := database.DB.First(&city, id).Error
	if err != nil {
		return nil, err
	}
	return &city, nil
}

func (s *CityService) GetAllCitiesWithLatestAQI() ([]models.CityWithLatestAQI, error) {
	cacheKey := "cities:latest_aqi"
	var result []models.CityWithLatestAQI

	if cache.Cache != nil {
		err := cache.Cache.Get(cacheKey, &result)
		if err == nil && len(result) > 0 {
			return result, nil
		}
	}

	cities, err := s.GetAllCities()
	if err != nil {
		return nil, err
	}

	for _, city := range cities {
		var latestRecord *models.AQIRecord
		database.DB.Where("city_id = ?", city.ID).Order("record_time DESC").Limit(1).Find(&latestRecord)

		var hasActiveAlert bool
		var alertLevel string
		var alert models.Alert
		database.DB.Where("city_id = ? AND is_resolved = ?", city.ID, 0).Order("created_at DESC").Limit(1).Find(&alert)
		if alert.ID > 0 {
			hasActiveAlert = true
			alertLevel = alert.AlertLevel
		}

		result = append(result, models.CityWithLatestAQI{
			City:          city,
			LatestRecord:  latestRecord,
			HasActiveAlert: hasActiveAlert,
			AlertLevel:    alertLevel,
		})
	}

	if cache.Cache != nil {
		cache.Cache.Set(cacheKey, result, 5*time.Minute)
	}

	return result, nil
}
