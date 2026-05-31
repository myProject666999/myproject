package models

import (
	"time"

	"gorm.io/gorm"
)

type ItemStatus string

const (
	ItemStatusAvailable ItemStatus = "available"
	ItemStatusBorrowed  ItemStatus = "borrowed"
	ItemStatusReserved  ItemStatus = "reserved"
	ItemStatusDamaged   ItemStatus = "damaged"
)

type Item struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Name         string         `json:"name" gorm:"not null"`
	Description  string         `json:"description"`
	Category     string         `json:"category"`
	TotalQuantity int            `json:"total_quantity" gorm:"not null"`
	Quantity     int            `json:"quantity" gorm:"not null"`
	Status       ItemStatus     `json:"status" gorm:"default:available"`
	Location     string         `json:"location"`
	ImageURL     string         `json:"image_url"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type BorrowStatus string

const (
	BorrowStatusBorrowed  BorrowStatus = "borrowed"
	BorrowStatusReturned  BorrowStatus = "returned"
	BorrowStatusOverdue   BorrowStatus = "overdue"
)

type Borrow struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	ItemID       uint           `json:"item_id" gorm:"not null"`
	Item         Item           `json:"item" gorm:"foreignKey:ItemID"`
	BorrowerName string         `json:"borrower_name" gorm:"not null"`
	BorrowerID   string         `json:"borrower_id" gorm:"not null"`
	Phone        string         `json:"phone"`
	BorrowDate   time.Time      `json:"borrow_date" gorm:"not null"`
	ExpectedReturnDate time.Time `json:"expected_return_date" gorm:"not null"`
	ActualReturnDate   *time.Time `json:"actual_return_date"`
	Status       BorrowStatus   `json:"status" gorm:"default:borrowed"`
	Remark       string         `json:"remark"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type ReservationStatus string

const (
	ReservationStatusWaiting   ReservationStatus = "waiting"
	ReservationStatusActive    ReservationStatus = "active"`
	ReservationStatusCompleted ReservationStatus = "completed"`
	ReservationStatusCancelled ReservationStatus = "cancelled"`
)

type Reservation struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	ItemID       uint           `json:"item_id" gorm:"not null"`
	Item         Item           `json:"item" gorm:"foreignKey:ItemID"`
	ReserverName string         `json:"reserver_name" gorm:"not null"`
	ReserverID   string         `json:"reserver_id" gorm:"not null"`
	Phone        string         `json:"phone"`
	QueuePosition int           `json:"queue_position"`
	ReserveDate  time.Time      `json:"reserve_date" gorm:"not null"`
	ExpiryDate   time.Time      `json:"expiry_date"`
	Status       ReservationStatus `json:"status" gorm:"default:waiting"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}
