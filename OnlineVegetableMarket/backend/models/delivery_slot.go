package models

import (
	"time"
)

type DeliverySlot struct {
	ID            uint64    `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	SlotDate      time.Time `gorm:"column:slot_date;type:date;not null;index" json:"slot_date"`
	StartTime     string    `gorm:"column:start_time;type:time;not null" json:"start_time"`
	EndTime       string    `gorm:"column:end_time;type:time;not null" json:"end_time"`
	MaxOrders     int       `gorm:"column:max_orders;default:20" json:"max_orders"`
	CurrentOrders int       `gorm:"column:current_orders;default:0" json:"current_orders"`
	Status        string    `gorm:"column:status;type:enum('available','full','disabled');default:available" json:"status"`
	CreatedAt     time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

func (DeliverySlot) TableName() string {
	return "delivery_slots"
}

type SlotCreateRequest struct {
	SlotDate  string `json:"slot_date" validate:"required"`
	StartTime string `json:"start_time" validate:"required"`
	EndTime   string `json:"end_time" validate:"required"`
	MaxOrders int    `json:"max_orders" validate:"required,gt=0"`
}
