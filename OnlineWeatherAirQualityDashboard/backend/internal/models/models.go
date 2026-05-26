package models

import (
	"time"
)

type City struct {
	ID          int       `json:"id" gorm:"primaryKey;autoIncrement"`
	Name        string    `json:"name" gorm:"size:100;not null;uniqueIndex"`
	Province    string    `json:"province" gorm:"size:100"`
	Country     string    `json:"country" gorm:"size:100;default:中国"`
	Latitude    float64   `json:"latitude" gorm:"type:decimal(10,7)"`
	Longitude   float64   `json:"longitude" gorm:"type:decimal(10,7)"`
	IsMonitored int       `json:"is_monitored" gorm:"default:1"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type AQIRecord struct {
	ID              int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	CityID          int       `json:"city_id" gorm:"not null;index"`
	AQI             int       `json:"aqi" gorm:"not null"`
	AQILevel        string    `json:"aqi_level" gorm:"size:50;not null"`
	PrimaryPollutant string   `json:"primary_pollutant" gorm:"size:100"`
	PM25            float64   `json:"pm25" gorm:"type:decimal(10,2)"`
	PM10            float64   `json:"pm10" gorm:"type:decimal(10,2)"`
	SO2             float64   `json:"so2" gorm:"type:decimal(10,2)"`
	NO2             float64   `json:"no2" gorm:"type:decimal(10,2)"`
	CO              float64   `json:"co" gorm:"type:decimal(10,3)"`
	O3              float64   `json:"o3" gorm:"type:decimal(10,2)"`
	Temperature     float64   `json:"temperature" gorm:"type:decimal(5,2)"`
	Humidity        float64   `json:"humidity" gorm:"type:decimal(5,2)"`
	WindDirection   string    `json:"wind_direction" gorm:"size:50"`
	WindSpeed       float64   `json:"wind_speed" gorm:"type:decimal(5,2)"`
	RecordTime      time.Time `json:"record_time" gorm:"not null;index"`
	CreatedAt       time.Time `json:"created_at"`

	City City `json:"city,omitempty" gorm:"foreignKey:CityID;constraint:OnDelete:CASCADE"`
}

type AQITrend struct {
	ID                int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	CityID            int       `json:"city_id" gorm:"not null"`
	TrendDate         time.Time `json:"trend_date" gorm:"type:date;not null;uniqueIndex:idx_city_date"`
	AvgAQI            float64   `json:"avg_aqi" gorm:"type:decimal(10,2)"`
	MaxAQI            int       `json:"max_aqi"`
	MinAQI            int       `json:"min_aqi"`
	AvgPM25           float64   `json:"avg_pm25" gorm:"type:decimal(10,2)"`
	AvgPM10           float64   `json:"avg_pm10" gorm:"type:decimal(10,2)"`
	AvgSO2            float64   `json:"avg_so2" gorm:"type:decimal(10,2)"`
	AvgNO2            float64   `json:"avg_no2" gorm:"type:decimal(10,2)"`
	AvgCO             float64   `json:"avg_co" gorm:"type:decimal(10,3)"`
	AvgO3             float64   `json:"avg_o3" gorm:"type:decimal(10,2)"`
	DominantPollutant string    `json:"dominant_pollutant" gorm:"size:100"`
	CreatedAt         time.Time `json:"created_at"`

	City City `json:"city,omitempty" gorm:"foreignKey:CityID;constraint:OnDelete:CASCADE"`
}

type Alert struct {
	ID            int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	CityID        int       `json:"city_id" gorm:"not null;index"`
	AlertType     string    `json:"alert_type" gorm:"size:50;not null"`
	AlertLevel    string    `json:"alert_level" gorm:"size:20;not null"`
	ThresholdValue int      `json:"threshold_value"`
	CurrentValue  int       `json:"current_value"`
	Message       string    `json:"message" gorm:"type:text;not null"`
	IsResolved    int       `json:"is_resolved" gorm:"default:0;index"`
	StartTime     time.Time `json:"start_time" gorm:"not null"`
	EndTime       *time.Time `json:"end_time,omitempty"`
	CreatedAt     time.Time `json:"created_at"`

	City City `json:"city,omitempty" gorm:"foreignKey:CityID;constraint:OnDelete:CASCADE"`
}

type UserSetting struct {
	ID           int       `json:"id" gorm:"primaryKey;autoIncrement"`
	SettingKey   string    `json:"setting_key" gorm:"size:100;not null;uniqueIndex"`
	SettingValue string    `json:"setting_value" gorm:"type:text;not null"`
	Description  string    `json:"description" gorm:"size:255"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type CityWithLatestAQI struct {
	City         City     `json:"city"`
	LatestRecord *AQIRecord `json:"latest_record,omitempty"`
	HasActiveAlert bool   `json:"has_active_alert"`
	AlertLevel    string  `json:"alert_level,omitempty"`
}
