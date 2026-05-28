package model

import "time"

type Order struct {
	ID               uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	RideID           uint64    `gorm:"column:ride_id;index" json:"ride_id"`
	RequestID        *uint64   `gorm:"column:request_id" json:"request_id"`
	OwnerID          uint64    `gorm:"column:owner_id;index" json:"owner_id"`
	PassengerID      uint64    `gorm:"column:passenger_id;index" json:"passenger_id"`
	PassengersCount  int       `gorm:"default:1" json:"passengers_count"`
	Price            float64   `gorm:"type:decimal(10,2);not null" json:"price"`
	PickupAddress    string    `gorm:"type:varchar(200)" json:"pickup_address"`
	DropoffAddress   string    `gorm:"type:varchar(200)" json:"dropoff_address"`
	Status           int       `gorm:"default:1" json:"status"`
	OwnerConfirmTime *time.Time `json:"owner_confirm_time"`
	StartTime        *time.Time `json:"start_time"`
	CompleteTime     *time.Time `json:"complete_time"`
	CancelTime       *time.Time `json:"cancel_time"`
	CancelReason     string    `gorm:"type:varchar(500)" json:"cancel_reason"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	Ride             *Ride     `gorm:"foreignKey:RideID" json:"ride,omitempty"`
	Owner            *User     `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Passenger        *User     `gorm:"foreignKey:PassengerID" json:"passenger,omitempty"`
}

func (Order) TableName() string {
	return "orders"
}

type CreateOrderRequest struct {
	RideID          uint64 `json:"ride_id" binding:"required"`
	RequestID       *uint64 `json:"request_id"`
	PassengersCount int    `json:"passengers_count" binding:"required,min=1"`
	PickupAddress   string `json:"pickup_address"`
	DropoffAddress  string `json:"dropoff_address"`
}

type CancelOrderRequest struct {
	Reason string `json:"reason"`
}

const (
	OrderStatusPending   = 1
	OrderStatusConfirmed = 2
	OrderStatusStarted   = 3
	OrderStatusCompleted = 4
	OrderStatusCancelled = 5
	OrderStatusRejected  = 6
)
