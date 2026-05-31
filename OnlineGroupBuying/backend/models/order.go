package models

import "time"

type Order struct {
	ID           uint       `json:"id" gorm:"primaryKey;autoIncrement"`
	OrderNo      string     `json:"order_no" gorm:"uniqueIndex;size:64;not null"`
	UserID       uint       `json:"user_id" gorm:"index;not null"`
	GroupID      uint       `json:"group_id" gorm:"index;not null"`
	ProductID    uint       `json:"product_id" gorm:"not null"`
	ProductName  string     `json:"product_name" gorm:"size:200;not null"`
	ProductImage string     `json:"product_image" gorm:"size:255;not null;default:''"`
	UnitPrice    float64    `json:"unit_price" gorm:"not null"`
	Quantity     int        `json:"quantity" gorm:"not null;default:1"`
	TotalAmount  float64    `json:"total_amount" gorm:"not null"`
	PayAmount    float64    `json:"pay_amount" gorm:"not null;default:0"`
	Status       int        `json:"status" gorm:"not null;default:0;comment:0待支付,1已支付,2已退款,3已取消"`
	PayTime      *time.Time `json:"pay_time" gorm:"null"`
	RefundTime   *time.Time `json:"refund_time" gorm:"null"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

func (Order) TableName() string {
	return "orders"
}
