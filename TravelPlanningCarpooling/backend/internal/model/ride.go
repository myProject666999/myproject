package model

import "time"

type Ride struct {
	ID               uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	OwnerID          uint64    `gorm:"column:owner_id;index" json:"owner_id"`
	VehicleID        uint64    `gorm:"column:vehicle_id;index" json:"vehicle_id"`
	Departure        string    `gorm:"type:varchar(100);not null" json:"departure"`
	DepartureLng     float64   `gorm:"type:decimal(10,7);not null" json:"departure_lng"`
	DepartureLat     float64   `gorm:"type:decimal(10,7);not null" json:"departure_lat"`
	Destination      string    `gorm:"type:varchar(100);not null" json:"destination"`
	DestinationLng   float64   `gorm:"type:decimal(10,7);not null" json:"destination_lng"`
	DestinationLat   float64   `gorm:"type:decimal(10,7);not null" json:"destination_lat"`
	DepartureTime    time.Time `gorm:"not null" json:"departure_time"`
	AvailableSeats   int       `gorm:"not null" json:"available_seats"`
	LockedSeats      int       `gorm:"default:0" json:"locked_seats"`
	PricePerPerson   float64   `gorm:"type:decimal(10,2);not null" json:"price_per_person"`
	Description      string    `gorm:"type:varchar(500)" json:"description"`
	Status           int       `gorm:"default:1" json:"status"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	Owner            *User     `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Vehicle          *Vehicle  `gorm:"foreignKey:VehicleID" json:"vehicle,omitempty"`
}

func (Ride) TableName() string {
	return "rides"
}

type CreateRideRequest struct {
	VehicleID      uint64    `json:"vehicle_id" binding:"required"`
	Departure      string    `json:"departure" binding:"required"`
	DepartureLng   float64   `json:"departure_lng" binding:"required"`
	DepartureLat   float64   `json:"departure_lat" binding:"required"`
	Destination    string    `json:"destination" binding:"required"`
	DestinationLng float64   `json:"destination_lng" binding:"required"`
	DestinationLat float64   `json:"destination_lat" binding:"required"`
	DepartureTime  time.Time `json:"departure_time" binding:"required"`
	AvailableSeats int       `json:"available_seats" binding:"required,min=1"`
	PricePerPerson float64   `json:"price_per_person" binding:"required,min=0"`
	Description    string    `json:"description"`
}

type RideListQuery struct {
	DepartureLng  *float64 `form:"departure_lng"`
	DepartureLat  *float64 `form:"departure_lat"`
	DestinationLng *float64 `form:"destination_lng"`
	DestinationLat *float64 `form:"destination_lat"`
	Radius        float64  `form:"radius" binding:"omitempty,min=1"`
	MinPrice      *float64 `form:"min_price"`
	MaxPrice      *float64 `form:"max_price"`
	MinSeats      *int     `form:"min_seats"`
	DepartureAfter *string  `form:"departure_after"`
	DepartureBefore *string `form:"departure_before"`
	Status        *int     `form:"status"`
	Page          int      `form:"page" binding:"omitempty,min=1"`
	PageSize      int      `form:"page_size" binding:"omitempty,min=1,max=50"`
}
