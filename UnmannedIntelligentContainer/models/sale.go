package models

import "time"

type Sale struct {
	BaseModel
	OrderNo    string     `gorm:"column:order_no;size:64;uniqueIndex;not null" json:"order_no"`
	ContainerID uint64    `gorm:"column:container_id;index;not null" json:"container_id"`
	ProductID   uint64    `gorm:"column:product_id;index;not null" json:"product_id"`
	Quantity    int       `gorm:"column:quantity;not null" json:"quantity"`
	UnitPrice   float64   `gorm:"column:unit_price;type:decimal(10,2);not null" json:"unit_price"`
	TotalAmount float64   `gorm:"column:total_amount;type:decimal(10,2);not null" json:"total_amount"`
	PayMethod   string    `gorm:"column:pay_method;size:32" json:"pay_method"`
	PayTime     *time.Time `gorm:"column:pay_time" json:"pay_time"`
	Status      int8      `gorm:"column:status;default:1;index" json:"status"`

	Container *Container `gorm:"foreignKey:ContainerID" json:"container,omitempty"`
	Product   *Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

func (Sale) TableName() string {
	return "sales"
}

type SaleQuery struct {
	Page        int       `form:"page" json:"page"`
	PageSize    int       `form:"page_size" json:"page_size"`
	ContainerID uint64    `form:"container_id" json:"container_id"`
	ProductID   uint64    `form:"product_id" json:"product_id"`
	StartDate   string    `form:"start_date" json:"start_date"`
	EndDate     string    `form:"end_date" json:"end_date"`
	Status      *int8     `form:"status" json:"status"`
}

type SaleCreate struct {
	OrderNo     string  `json:"order_no" binding:"required"`
	ContainerID uint64  `json:"container_id" binding:"required"`
	ProductID   uint64  `json:"product_id" binding:"required"`
	Quantity    int     `json:"quantity" binding:"required,min=1"`
	PayMethod   string  `json:"pay_method"`
}

type SaleRefund struct {
	OrderNo string `json:"order_no" binding:"required"`
}

type SaleStatistics struct {
	TotalSales     float64 `json:"total_sales"`
	TotalOrders    int64   `json:"total_orders"`
	TotalQuantity  int64   `json:"total_quantity"`
	AverageOrder   float64 `json:"average_order"`
}

type ContainerSaleStats struct {
	ContainerID   uint64  `json:"container_id"`
	ContainerNo   string  `json:"container_no"`
	ContainerName string  `json:"container_name"`
	TotalSales    float64 `json:"total_sales"`
	TotalQuantity int64   `json:"total_quantity"`
	OrderCount    int64   `json:"order_count"`
}

type ProductSaleStats struct {
	ProductID     uint64  `json:"product_id"`
	ProductCode   string  `json:"product_code"`
	ProductName   string  `json:"product_name"`
	Category      string  `json:"category"`
	TotalSales    float64 `json:"total_sales"`
	TotalQuantity int64   `json:"total_quantity"`
	OrderCount    int64   `json:"order_count"`
}
