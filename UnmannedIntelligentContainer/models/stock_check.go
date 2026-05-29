package models

import (
	"time"

	"unmanned-container/utils"
)

type StockCheck struct {
	BaseModel
	CheckNo         string     `gorm:"column:check_no;size:64;uniqueIndex;not null" json:"check_no"`
	ContainerID     uint64     `gorm:"column:container_id;index;not null" json:"container_id"`
	ReplenisherID   uint64     `gorm:"column:replenisher_id;index;not null" json:"replenisher_id"`
	CheckTime       time.Time  `gorm:"column:check_time;index;not null" json:"check_time"`
	TotalExpected   int        `gorm:"column:total_expected;default:0" json:"total_expected"`
	TotalActual     int        `gorm:"column:total_actual;default:0" json:"total_actual"`
	TotalDifference int        `gorm:"column:total_difference;default:0" json:"total_difference"`
	DamageAmount    float64    `gorm:"column:damage_amount;type:decimal(10,2);default:0" json:"damage_amount"`
	Status          int8       `gorm:"column:status;default:0;index" json:"status"`
	Remark          string     `gorm:"column:remark;size:512" json:"remark"`

	Container   *Container          `gorm:"foreignKey:ContainerID" json:"container,omitempty"`
	Replenisher *Replenisher        `gorm:"foreignKey:ReplenisherID" json:"replenisher,omitempty"`
	Items       []StockCheckItem    `gorm:"foreignKey:CheckID" json:"items,omitempty"`
}

func (StockCheck) TableName() string {
	return "stock_checks"
}

type StockCheckItem struct {
	BaseModel
	CheckID          uint64  `gorm:"column:check_id;index;not null" json:"check_id"`
	ProductID        uint64  `gorm:"column:product_id;index;not null" json:"product_id"`
	ExpectedQuantity int     `gorm:"column:expected_quantity;not null" json:"expected_quantity"`
	ActualQuantity   int     `gorm:"column:actual_quantity;not null" json:"actual_quantity"`
	Difference       int     `gorm:"column:difference;not null" json:"difference"`
	UnitPrice        float64 `gorm:"column:unit_price;type:decimal(10,2);not null" json:"unit_price"`
	DifferenceAmount float64 `gorm:"column:difference_amount;type:decimal(10,2);not null" json:"difference_amount"`
	DamageQuantity   int     `gorm:"column:damage_quantity;default:0" json:"damage_quantity"`
	DamageReason     string  `gorm:"column:damage_reason;size:256" json:"damage_reason"`

	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

func (StockCheckItem) TableName() string {
	return "stock_check_items"
}

type StockCheckQuery struct {
	Page        int     `form:"page" json:"page"`
	PageSize    int     `form:"page_size" json:"page_size"`
	CheckNo     string  `form:"check_no" json:"check_no"`
	ContainerID uint64  `form:"container_id" json:"container_id"`
	ReplenisherID uint64 `form:"replenisher_id" json:"replenisher_id"`
	StartDate   string  `form:"start_date" json:"start_date"`
	EndDate     string  `form:"end_date" json:"end_date"`
	Status      *int8   `form:"status" json:"status"`
}

type StockCheckCreate struct {
	ContainerID   uint64              `json:"container_id" binding:"required"`
	ReplenisherID uint64              `json:"replenisher_id" binding:"required"`
	CheckTime     utils.CustomTime    `json:"check_time" binding:"required"`
	Items         []StockCheckItemDTO `json:"items" binding:"required,min=1"`
	Remark        string              `json:"remark"`
}

type StockCheckItemDTO struct {
	ProductID      uint64 `json:"product_id" binding:"required"`
	ExpectedQuantity int  `json:"expected_quantity" binding:"min=0"`
	ActualQuantity   int  `json:"actual_quantity" binding:"min=0"`
	DamageQuantity   int  `json:"damage_quantity" binding:"min=0"`
	DamageReason     string `json:"damage_reason"`
}

type StockCheckProcess struct {
	CheckID uint64 `json:"check_id" binding:"required"`
	Remark  string `json:"remark"`
}

type DamageRecord struct {
	BaseModel
	RecordNo    string    `gorm:"column:record_no;size:64;uniqueIndex;not null" json:"record_no"`
	ContainerID uint64    `gorm:"column:container_id;index;not null" json:"container_id"`
	ProductID   uint64    `gorm:"column:product_id;index;not null" json:"product_id"`
	Quantity    int       `gorm:"column:quantity;not null" json:"quantity"`
	UnitPrice   float64   `gorm:"column:unit_price;type:decimal(10,2);not null" json:"unit_price"`
	TotalAmount float64   `gorm:"column:total_amount;type:decimal(10,2);not null" json:"total_amount"`
	Reason      string    `gorm:"column:reason;size:256;not null" json:"reason"`
	HandlerID   uint64    `gorm:"column:handler_id;index;not null" json:"handler_id"`
	HandleTime  time.Time `gorm:"column:handle_time;index;not null" json:"handle_time"`
	CheckID     *uint64   `gorm:"column:check_id;index" json:"check_id"`

	Container *Container  `gorm:"foreignKey:ContainerID" json:"container,omitempty"`
	Product   *Product    `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Handler   *Replenisher `gorm:"foreignKey:HandlerID" json:"handler,omitempty"`
	Check     *StockCheck `gorm:"foreignKey:CheckID" json:"check,omitempty"`
}

func (DamageRecord) TableName() string {
	return "damage_records"
}

type DamageRecordQuery struct {
	Page        int     `form:"page" json:"page"`
	PageSize    int     `form:"page_size" json:"page_size"`
	RecordNo    string  `form:"record_no" json:"record_no"`
	ContainerID uint64  `form:"container_id" json:"container_id"`
	ProductID   uint64  `form:"product_id" json:"product_id"`
	StartDate   string  `form:"start_date" json:"start_date"`
	EndDate     string  `form:"end_date" json:"end_date"`
}

type DamageRecordCreate struct {
	ContainerID uint64           `json:"container_id" binding:"required"`
	ProductID   uint64           `json:"product_id" binding:"required"`
	Quantity    int              `json:"quantity" binding:"required,min=1"`
	Reason      string           `json:"reason" binding:"required"`
	HandlerID   uint64           `json:"handler_id" binding:"required"`
	HandleTime  utils.CustomTime `json:"handle_time" binding:"required"`
	CheckID     *uint64          `json:"check_id"`
}
