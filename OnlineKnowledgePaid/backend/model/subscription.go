package model

import "time"

type Subscription struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint64    `gorm:"not null" json:"user_id"`
	ColumnID  uint64    `gorm:"not null" json:"column_id"`
	OrderID   uint64    `gorm:"not null" json:"order_id"`
	Status    int8      `gorm:"not null;default:1" json:"status"`
	StartDate time.Time `gorm:"type:date;not null" json:"start_date"`
	EndDate   time.Time `gorm:"type:date;not null" json:"end_date"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Column    *Column   `gorm:"foreignKey:ColumnID" json:"column,omitempty"`
}

func (Subscription) TableName() string {
	return "subscriptions"
}
