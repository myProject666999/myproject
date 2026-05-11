package models

import (
	"time"
)

type Order struct {
	ID             uint       `gorm:"primary_key" json:"id"`
	OrderNo        string     `gorm:"unique;not null" json:"order_no"`
	UserID         uint       `json:"user_id"`
	User           User       `gorm:"foreignKey:UserID" json:"user"`
	TotalAmount    float64    `gorm:"type:decimal(10,2);not null" json:"total_amount"`
	Status         string     `gorm:"default:'pending'" json:"status"`
	PaymentMethod  string     `json:"payment_method"`
	ShippingName   string     `json:"shipping_name"`
	ShippingPhone  string     `json:"shipping_phone"`
	ShippingAddress string    `json:"shipping_address"`
	Remark         string     `json:"remark"`
	PaidAt         *time.Time `json:"paid_at"`
	ShippedAt      *time.Time `json:"shipped_at"`
	CompletedAt    *time.Time `json:"completed_at"`
	CanceledAt     *time.Time `json:"canceled_at"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
	DeletedAt      *time.Time `sql:"index" json:"-"`
	OrderItems     []OrderItem `gorm:"foreignKey:OrderID" json:"order_items"`
}

type OrderItem struct {
	ID          uint       `gorm:"primary_key" json:"id"`
	OrderID     uint       `json:"order_id"`
	Order       Order      `gorm:"foreignKey:OrderID" json:"order"`
	ProductID   uint       `json:"product_id"`
	Product     Product    `gorm:"foreignKey:ProductID" json:"product"`
	ProductName string     `json:"product_name"`
	Price       float64    `gorm:"type:decimal(10,2);not null" json:"price"`
	Quantity    int        `gorm:"not null" json:"quantity"`
	TotalPrice  float64    `gorm:"type:decimal(10,2);not null" json:"total_price"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type Cart struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	UserID    uint       `json:"user_id"`
	User      User       `gorm:"foreignKey:UserID" json:"user"`
	ProductID uint       `json:"product_id"`
	Product   Product    `gorm:"foreignKey:ProductID" json:"product"`
	Quantity  int        `gorm:"default:1" json:"quantity"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type Address struct {
	ID             uint       `gorm:"primary_key" json:"id"`
	UserID         uint       `json:"user_id"`
	User           User       `gorm:"foreignKey:UserID" json:"user"`
	Name           string     `gorm:"not null" json:"name"`
	Phone          string     `gorm:"not null" json:"phone"`
	Province       string     `json:"province"`
	City           string     `json:"city"`
	District       string     `json:"district"`
	DetailAddress  string     `gorm:"not null" json:"detail_address"`
	IsDefault      bool       `gorm:"default:false" json:"is_default"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type Favorite struct {
	ID         uint       `gorm:"primary_key" json:"id"`
	UserID     uint       `json:"user_id"`
	User       User       `gorm:"foreignKey:UserID" json:"user"`
	Type       string     `json:"type"`
	TargetID   uint       `json:"target_id"`
	CreatedAt  time.Time  `json:"created_at"`
}
