package models

import (
	"time"
)

type DailyInventory struct {
	ID                 uint64    `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	ProductID          uint64    `gorm:"column:product_id;not null;index" json:"product_id"`
	InventoryDate      time.Time `gorm:"column:inventory_date;type:date;not null;index" json:"inventory_date"`
	TotalQuantity      float64   `gorm:"column:total_quantity;type:decimal(10,2);not null" json:"total_quantity"`
	RemainingQuantity  float64   `gorm:"column:remaining_quantity;type:decimal(10,2);not null" json:"remaining_quantity"`
	Version            int       `gorm:"column:version;default:0" json:"version"`
	CreatedAt          time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt          time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

func (DailyInventory) TableName() string {
	return "daily_inventory"
}

type InventoryUpdateRequest struct {
	ProductID     uint64  `json:"product_id" validate:"required"`
	InventoryDate string  `json:"inventory_date" validate:"required"`
	TotalQuantity float64 `json:"total_quantity" validate:"required,gte=0"`
}
