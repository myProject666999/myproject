package model

import "time"

type Order struct {
	ID         uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderNo    string    `gorm:"size:64;uniqueIndex;not null" json:"order_no"`
	UserID     uint64    `gorm:"not null" json:"user_id"`
	ColumnID   uint64    `gorm:"not null" json:"column_id"`
	Amount     float64   `gorm:"type:decimal(10,2);not null" json:"amount"`
	Status     int8      `gorm:"not null;default:0" json:"status"`
	PayMethod  string    `gorm:"size:32" json:"pay_method"`
	PaidAt     *time.Time `json:"paid_at"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	User       *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Column     *Column   `gorm:"foreignKey:ColumnID" json:"column,omitempty"`
}

func (Order) TableName() string {
	return "orders"
}
