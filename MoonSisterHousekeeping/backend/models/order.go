package models

import "time"

type Order struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	OrderNo     string    `json:"order_no" gorm:"uniqueIndex;size:50"`
	CustomerID  uint      `json:"customer_id"`
	NannyID     uint      `json:"nanny_id"`
	DemandID    uint      `json:"demand_id"`
	ServiceType string    `json:"service_type" gorm:"size:50"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	TotalDays   int       `json:"total_days"`
	Price       float64   `json:"price"`
	Status      string    `json:"status" gorm:"size:20"`
	Address     string    `json:"address" gorm:"size:255"`
	Notes       string    `json:"notes" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Contract struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	OrderID        uint      `json:"order_id"`
	ContractNo     string    `json:"contract_no" gorm:"uniqueIndex;size:50"`
	Content        string    `json:"content" gorm:"type:longtext"`
	CustomerSigned bool      `json:"customer_signed" gorm:"default:false"`
	NannySigned    bool      `json:"nanny_signed" gorm:"default:false"`
	CustomerSignAt *time.Time `json:"customer_sign_at"`
	NannySignAt    *time.Time `json:"nanny_sign_at"`
	Status         string    `json:"status" gorm:"size:20"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
