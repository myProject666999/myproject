package models

import (
	"time"

	"gorm.io/gorm"
)

type Day struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	TripID     uint           `json:"trip_id" gorm:"index;not null"`
	Date       time.Time      `json:"date"`
	OrderIndex int            `json:"order_index" gorm:"default:0"`
	Attractions []Attraction  `json:"attractions" gorm:"foreignKey:DayID"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

func (Day) TableName() string {
	return "days"
}
