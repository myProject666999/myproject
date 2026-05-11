package models

import (
	"time"

	"gorm.io/gorm"
)

type Flight struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	FlightNumber    string         `json:"flight_number" gorm:"type:varchar(50);uniqueIndex;not null"`
	Airline         string         `json:"airline" gorm:"type:varchar(100);not null"`
	DepartureCity   string         `json:"departure_city" gorm:"type:varchar(50);not null"`
	ArrivalCity     string         `json:"arrival_city" gorm:"type:varchar(50);not null"`
	DepartureTime   time.Time      `json:"departure_time" gorm:"not null"`
	ArrivalTime     time.Time      `json:"arrival_time" gorm:"not null"`
	EconomyPrice    float64        `json:"economy_price" gorm:"not null"`
	BusinessPrice   float64        `json:"business_price"`
	FirstClassPrice float64        `json:"first_class_price"`
	EconomySeats    int            `json:"economy_seats" gorm:"default:150"`
	BusinessSeats   int            `json:"business_seats" gorm:"default:50"`
	FirstClassSeats int            `json:"first_class_seats" gorm:"default:20"`
	Status          string         `json:"status" gorm:"type:varchar(50);default:available"`
	Aircraft        string         `json:"aircraft" gorm:"type:varchar(100)"`
}
