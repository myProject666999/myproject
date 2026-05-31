package models

import (
	"time"

	"gorm.io/gorm"
)

type Budget struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	TripID    uint           `json:"trip_id" gorm:"index;not null"`
	Category  string         `json:"category" gorm:"size:50;not null"`
	Amount    float64        `json:"amount" gorm:"default:0"`
	Notes     string         `json:"notes" gorm:"size:1000"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

func (Budget) TableName() string {
	return "budgets"
}
