package models

import (
	"time"

	"gorm.io/gorm"
)

type Attraction struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	DayID       uint           `json:"day_id" gorm:"index;not null"`
	Name        string         `json:"name" gorm:"not null;size:200"`
	Type        string         `json:"type" gorm:"size:20;not null"`
	Description string         `json:"description" gorm:"size:1000"`
	Latitude    float64        `json:"latitude"`
	Longitude   float64        `json:"longitude"`
	Address     string         `json:"address" gorm:"size:500"`
	StartTime   string         `json:"start_time" gorm:"size:10"`
	EndTime     string         `json:"end_time" gorm:"size:10"`
	Cost        float64        `json:"cost" gorm:"default:0"`
	Notes       string         `json:"notes" gorm:"size:1000"`
	OrderIndex  int            `json:"order_index" gorm:"default:0"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

func (Attraction) TableName() string {
	return "attractions"
}
