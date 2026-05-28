package model

import "time"

type RideRequest struct {
	ID              uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	PassengerID     uint64    `gorm:"column:passenger_id;index" json:"passenger_id"`
	Departure       string    `gorm:"type:varchar(100);not null" json:"departure"`
	DepartureLng    float64   `gorm:"type:decimal(10,7);not null" json:"departure_lng"`
	DepartureLat    float64   `gorm:"type:decimal(10,7);not null" json:"departure_lat"`
	Destination     string    `gorm:"type:varchar(100);not null" json:"destination"`
	DestinationLng  float64   `gorm:"type:decimal(10,7);not null" json:"destination_lng"`
	DestinationLat  float64   `gorm:"type:decimal(10,7);not null" json:"destination_lat"`
	EarliestTime    time.Time `gorm:"not null" json:"earliest_time"`
	LatestTime      time.Time `gorm:"not null" json:"latest_time"`
	PassengersCount int       `gorm:"default:1" json:"passengers_count"`
	MaxPrice        float64   `gorm:"type:decimal(10,2)" json:"max_price"`
	Description     string    `gorm:"type:varchar(500)" json:"description"`
	Status          int       `gorm:"default:1" json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	Passenger       *User     `gorm:"foreignKey:PassengerID" json:"passenger,omitempty"`
}

func (RideRequest) TableName() string {
	return "ride_requests"
}

type CreateRideRequestReq struct {
	Departure       string    `json:"departure" binding:"required"`
	DepartureLng    float64   `json:"departure_lng" binding:"required"`
	DepartureLat    float64   `json:"departure_lat" binding:"required"`
	Destination     string    `json:"destination" binding:"required"`
	DestinationLng  float64   `json:"destination_lng" binding:"required"`
	DestinationLat  float64   `json:"destination_lat" binding:"required"`
	EarliestTime    time.Time `json:"earliest_time" binding:"required"`
	LatestTime      time.Time `json:"latest_time" binding:"required"`
	PassengersCount int       `json:"passengers_count" binding:"required,min=1"`
	MaxPrice        float64   `json:"max_price" binding:"omitempty,min=0"`
	Description     string    `json:"description"`
}
