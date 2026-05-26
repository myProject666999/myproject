package scheduler

import (
	"fmt"
	"math/rand"
	"time"

	"air-quality-dashboard/internal/models"
	"air-quality-dashboard/internal/services"
)

type Scheduler struct {
	cityService    *services.CityService
	aqiService     *services.AQIService
	alertService   *services.AlertService
	trendService   *services.TrendService
	settingService *services.SettingService
}

func NewScheduler() *Scheduler {
	return &Scheduler{
		cityService:    services.NewCityService(),
		aqiService:     services.NewAQIService(),
		alertService:   services.NewAlertService(),
		trendService:   services.NewTrendService(),
		settingService: services.NewSettingService(),
	}
}

func (s *Scheduler) Start() {
	fmt.Println("Scheduler started")

	collectionInterval := s.settingService.GetSettingInt("collection_interval_minutes", 30)
	alertCheckInterval := s.settingService.GetSettingInt("alert_check_interval_minutes", 10)

	go s.runEvery(collectionInterval, s.collectData)
	go s.runEvery(alertCheckInterval, s.checkAlerts)
	go s.runDaily(2, 0, s.aggregateTrends)
}

func (s *Scheduler) runEvery(minutes int, task func()) {
	ticker := time.NewTicker(time.Duration(minutes) * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		task()
	}
}

func (s *Scheduler) runDaily(hour, minute int, task func()) {
	for {
		now := time.Now()
		next := time.Date(now.Year(), now.Month(), now.Day(), hour, minute, 0, 0, now.Location())
		if next.Before(now) {
			next = next.Add(24 * time.Hour)
		}

		duration := next.Sub(now)
		time.Sleep(duration)

		task()
	}
}

func (s *Scheduler) collectData() {
	fmt.Println("Collecting data from third-party API...")

	cities, err := s.cityService.GetAllCities()
	if err != nil {
		fmt.Printf("Error getting cities: %v\n", err)
		return
	}

	for _, city := range cities {
		aqi := s.simulateAQIReading()
		pm25 := float64(aqi) * 0.75
		pm10 := float64(aqi) * 1.2
		so2 := float64(aqi) * 0.1
		no2 := float64(aqi) * 0.4
		co := float64(aqi) * 0.01
		o3 := float64(aqi) * 0.8

		record := &models.AQIRecord{
			CityID:           city.ID,
			AQI:              aqi,
			AQILevel:         s.aqiService.GetAQILevel(aqi),
			PrimaryPollutant: s.getPrimaryPollutant(pm25, pm10, o3),
			PM25:             pm25,
			PM10:             pm10,
			SO2:              so2,
			NO2:              no2,
			CO:               co,
			O3:               o3,
			Temperature:      15 + rand.Float64()*15,
			Humidity:         40 + rand.Float64()*40,
			WindDirection:    s.getRandomWindDirection(),
			WindSpeed:        rand.Float64() * 5,
			RecordTime:       time.Now(),
		}

		if err := s.aqiService.AddAQIRecord(record); err != nil {
			fmt.Printf("Error adding AQI record for city %s: %v\n", city.Name, err)
		}

		s.alertService.CheckAndCreateAlerts(city.ID, aqi, pm25)
	}

	fmt.Println("Data collection completed")
}

func (s *Scheduler) simulateAQIReading() int {
	baseValues := []int{45, 60, 75, 90, 110, 130, 160}
	idx := rand.Intn(len(baseValues))
	variation := rand.Intn(30) - 15
	aqi := baseValues[idx] + variation
	if aqi < 0 {
		aqi = 0
	}
	if aqi > 500 {
		aqi = 500
	}
	return aqi
}

func (s *Scheduler) getPrimaryPollutant(pm25, pm10, o3 float64) string {
	maxVal := pm25
	pollutant := "PM2.5"

	if pm10 > maxVal {
		maxVal = pm10
		pollutant = "PM10"
	}

	if o3 > maxVal {
		pollutant = "O3"
	}

	return pollutant
}

func (s *Scheduler) getRandomWindDirection() string {
	directions := []string{"北风", "东北风", "东风", "东南风", "南风", "西南风", "西风", "西北风"}
	return directions[rand.Intn(len(directions))]
}

func (s *Scheduler) checkAlerts() {
	fmt.Println("Checking alerts...")

	cities, err := s.cityService.GetAllCities()
	if err != nil {
		fmt.Printf("Error getting cities: %v\n", err)
		return
	}

	for _, city := range cities {
		latest, err := s.aqiService.GetLatestAQIByCity(city.ID)
		if err != nil {
			continue
		}

		warningThreshold := 150
		if latest.AQI < warningThreshold {
			alerts, _ := s.alertService.GetAlertsByCity(city.ID, 10)
			for _, alert := range alerts {
				if alert.IsResolved == 0 {
					s.alertService.ResolveAlert(alert.ID)
				}
			}
		}
	}

	fmt.Println("Alert check completed")
}

func (s *Scheduler) aggregateTrends() {
	fmt.Println("Aggregating daily trends...")

	cities, err := s.cityService.GetAllCities()
	if err != nil {
		fmt.Printf("Error getting cities: %v\n", err)
		return
	}

	yesterday := time.Now().AddDate(0, 0, -1)
	for _, city := range cities {
		if err := s.trendService.AggregateDailyTrend(city.ID, yesterday); err != nil {
			fmt.Printf("Error aggregating trend for city %s: %v\n", city.Name, err)
		}
	}

	fmt.Println("Trend aggregation completed")
}

func (s *Scheduler) RunImmediateCollection() {
	s.collectData()
}
