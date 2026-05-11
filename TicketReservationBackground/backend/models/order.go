package models

import (
	"time"

	"gorm.io/gorm"
)

type Order struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	OrderNumber    string         `json:"order_number" gorm:"type:varchar(100);uniqueIndex;not null"`
	UserID         uint           `json:"user_id" gorm:"not null"`
	User           User           `json:"user" gorm:"foreignKey:UserID"`
	FlightID       uint           `json:"flight_id" gorm:"not null"`
	Flight         Flight         `json:"flight" gorm:"foreignKey:FlightID"`
	SeatClass      string         `json:"seat_class" gorm:"type:varchar(50);not null"`
	PassengerName  string         `json:"passenger_name" gorm:"type:varchar(100);not null"`
	PassengerPhone string         `json:"passenger_phone" gorm:"type:varchar(20);not null"`
	PassengerID    string         `json:"passenger_id" gorm:"type:varchar(50);not null"`
	ContactName    string         `json:"contact_name" gorm:"type:varchar(100);not null"`
	ContactPhone   string         `json:"contact_phone" gorm:"type:varchar(20);not null"`
	TotalPrice     float64        `json:"total_price" gorm:"not null"`
	Status         string         `json:"status" gorm:"type:varchar(50);default:pending"`
}
