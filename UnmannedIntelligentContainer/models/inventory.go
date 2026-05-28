package models

import "time"

type Inventory struct {
	BaseModel
	ContainerID      uint64     `gorm:"column:container_id;uniqueIndex:idx_container_product;not null" json:"container_id"`
	ProductID        uint64     `gorm:"column:product_id;uniqueIndex:idx_container_product;not null" json:"product_id"`
	Quantity         int        `gorm:"column:quantity;default:0;index:idx_low_stock" json:"quantity"`
	MaxQuantity      int        `gorm:"column:max_quantity;default:20" json:"max_quantity"`
	Threshold        int        `gorm:"column:threshold;default:5;index:idx_low_stock" json:"threshold"`
	LastSaleTime     *time.Time `gorm:"column:last_sale_time" json:"last_sale_time"`
	LastReplenishTime *time.Time `gorm:"column:last_replenish_time" json:"last_replenish_time"`

	Container *Container `gorm:"foreignKey:ContainerID" json:"container,omitempty"`
	Product   *Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

func (Inventory) TableName() string {
	return "inventory"
}

type InventoryQuery struct {
	Page        int    `form:"page" json:"page"`
	PageSize    int    `form:"page_size" json:"page_size"`
	ContainerID uint64 `form:"container_id" json:"container_id"`
	ProductID   uint64 `form:"product_id" json:"product_id"`
	LowStock    *bool  `form:"low_stock" json:"low_stock"`
}

type InventoryCreate struct {
	ContainerID uint64 `json:"container_id" binding:"required"`
	ProductID   uint64 `json:"product_id" binding:"required"`
	Quantity    int    `json:"quantity" binding:"min=0"`
	MaxQuantity int    `json:"max_quantity" binding:"min=1"`
	Threshold   int    `json:"threshold" binding:"min=0"`
}

type InventoryUpdate struct {
	Quantity    *int `json:"quantity" binding:"omitempty,min=0"`
	MaxQuantity *int `json:"max_quantity" binding:"omitempty,min=1"`
	Threshold   *int `json:"threshold" binding:"omitempty,min=0"`
}

type LowStockItem struct {
	ContainerID   uint64 `json:"container_id"`
	ContainerNo   string `json:"container_no"`
	ContainerName string `json:"container_name"`
	Area          string `json:"area"`
	ProductID     uint64 `json:"product_id"`
	ProductCode   string `json:"product_code"`
	ProductName   string `json:"product_name"`
	Category      string `json:"category"`
	Quantity      int    `json:"quantity"`
	Threshold     int    `json:"threshold"`
	MaxQuantity   int    `json:"max_quantity"`
	NeedQuantity  int    `json:"need_quantity"`
}
