package services

import (
	"time"

	"air-quality-dashboard/internal/cache"
	"air-quality-dashboard/internal/database"
	"air-quality-dashboard/internal/models"
)

type TrendService struct{}

func NewTrendService() *TrendService {
	return &TrendService{}
}

func (s *TrendService) GetCityTrend(cityID int, days int) ([]models.AQITrend, error) {
	cacheKey := "trend:city:" + string(rune(cityID)) + ":" + string(rune(days))
	var trends []models.AQITrend

	if cache.Cache != nil {
		err := cache.Cache.Get(cacheKey, &trends)
		if err == nil && len(trends) > 0 {
			return trends, nil
		}
	}

	since := time.Now().AddDate(0, 0, -days)
	err := database.DB.Where("city_id = ? AND trend_date >= ?", cityID, since).
		Order("trend_date ASC").
		Find(&trends).Error

	if cache.Cache != nil && err == nil {
		cache.Cache.Set(cacheKey, trends, 1*time.Hour)
	}

	return trends, err
}

func (s *TrendService) GetCitiesComparison(cityIDs []int, days int) (map[int][]models.AQITrend, error) {
	result := make(map[int][]models.AQITrend)
	since := time.Now().AddDate(0, 0, -days)

	for _, cityID := range cityIDs {
		var trends []models.AQITrend
		err := database.DB.Where("city_id = ? AND trend_date >= ?", cityID, since).
			Order("trend_date ASC").
			Find(&trends).Error
		if err != nil {
			return nil, err
		}
		result[cityID] = trends
	}

	return result, nil
}

func (s *TrendService) AggregateDailyTrend(cityID int, date time.Time) error {
	var records []models.AQIRecord
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	err := database.DB.Where("city_id = ? AND record_time >= ? AND record_time < ?", cityID, startOfDay, endOfDay).
		Find(&records).Error
	if err != nil {
		return err
	}

	if len(records) == 0 {
		return nil
	}

	var totalAQI, totalPM25, totalPM10, totalSO2, totalNO2, totalCO, totalO3 float64
	maxAQI := 0
	minAQI := 9999

	for _, r := range records {
		totalAQI += float64(r.AQI)
		totalPM25 += r.PM25
		totalPM10 += r.PM10
		totalSO2 += r.SO2
		totalNO2 += r.NO2
		totalCO += r.CO
		totalO3 += r.O3

		if r.AQI > maxAQI {
			maxAQI = r.AQI
		}
		if r.AQI < minAQI {
			minAQI = r.AQI
		}
	}

	n := float64(len(records))
	trend := models.AQITrend{
		CityID:            cityID,
		TrendDate:         startOfDay,
		AvgAQI:            totalAQI / n,
		MaxAQI:            maxAQI,
		MinAQI:            minAQI,
		AvgPM25:           totalPM25 / n,
		AvgPM10:           totalPM10 / n,
		AvgSO2:            totalSO2 / n,
		AvgNO2:            totalNO2 / n,
		AvgCO:             totalCO / n,
		AvgO3:             totalO3 / n,
		DominantPollutant: s.findDominantPollutant(records),
	}

	var existingTrend models.AQITrend
	result := database.DB.Where("city_id = ? AND trend_date = ?", cityID, startOfDay).First(&existingTrend)
	if result.Error == nil {
		trend.ID = existingTrend.ID
		return database.DB.Save(&trend).Error
	}

	return database.DB.Create(&trend).Error
}

func (s *TrendService) findDominantPollutant(records []models.AQIRecord) string {
	pollutantCount := make(map[string]int)
	for _, r := range records {
		if r.PrimaryPollutant != "" {
			pollutantCount[r.PrimaryPollutant]++
		}
	}

	maxCount := 0
	dominant := ""
	for p, count := range pollutantCount {
		if count > maxCount {
			maxCount = count
			dominant = p
		}
	}

	return dominant
}
