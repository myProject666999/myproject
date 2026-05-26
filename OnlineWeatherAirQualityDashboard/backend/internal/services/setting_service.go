package services

import (
	"strconv"
	"time"

	"air-quality-dashboard/internal/cache"
	"air-quality-dashboard/internal/database"
	"air-quality-dashboard/internal/models"
)

type SettingService struct{}

func NewSettingService() *SettingService {
	return &SettingService{}
}

func (s *SettingService) GetAllSettings() ([]models.UserSetting, error) {
	var settings []models.UserSetting
	err := database.DB.Find(&settings).Error
	return settings, err
}

func (s *SettingService) GetSetting(key string) (*models.UserSetting, error) {
	cacheKey := "setting:" + key
	var setting models.UserSetting

	if cache.Cache != nil {
		err := cache.Cache.Get(cacheKey, &setting)
		if err == nil && setting.ID > 0 {
			return &setting, nil
		}
	}

	err := database.DB.Where("setting_key = ?", key).First(&setting).Error
	if err != nil {
		return nil, err
	}

	if cache.Cache != nil {
		cache.Cache.Set(cacheKey, setting, 1*time.Hour)
	}

	return &setting, nil
}

func (s *SettingService) GetSettingInt(key string, defaultValue int) int {
	setting, err := s.GetSetting(key)
	if err != nil {
		return defaultValue
	}
	val, err := strconv.Atoi(setting.SettingValue)
	if err != nil {
		return defaultValue
	}
	return val
}

func (s *SettingService) UpdateSetting(key, value, description string) (*models.UserSetting, error) {
	var setting models.UserSetting
	result := database.DB.Where("setting_key = ?", key).First(&setting)

	if result.Error != nil {
		setting = models.UserSetting{
			SettingKey:   key,
			SettingValue: value,
			Description:  description,
		}
		err := database.DB.Create(&setting).Error
		if err != nil {
			return nil, err
		}
	} else {
		setting.SettingValue = value
		if description != "" {
			setting.Description = description
		}
		setting.UpdatedAt = time.Now()
		err := database.DB.Save(&setting).Error
		if err != nil {
			return nil, err
		}
	}

	if cache.Cache != nil {
		cache.Cache.Delete("setting:" + key)
	}

	return &setting, nil
}
