package models

import (
	"time"
)

type Product struct {
	ID           uint64    `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	CategoryID   uint64    `gorm:"column:category_id;not null;index" json:"category_id"`
	Name         string    `gorm:"column:name;size:100;not null" json:"name"`
	Description  string    `gorm:"column:description;type:text" json:"description"`
	ImageURL     string    `gorm:"column:image_url;size:500" json:"image_url"`
	PriceUnit    string    `gorm:"column:price_unit;type:enum('weight','piece');default:weight" json:"price_unit"`
	Price        float64   `gorm:"column:price;type:decimal(10,2);not null" json:"price"`
	UnitWeight   float64   `gorm:"column:unit_weight;type:decimal(10,2)" json:"unit_weight"`
	Origin       string    `gorm:"column:origin;size:100" json:"origin"`
	Status       string    `gorm:"column:status;type:enum('on_sale','off_shelf','sold_out');default:on_sale" json:"status"`
	Sort         int       `gorm:"column:sort;default:0" json:"sort"`
	CreatedAt    time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	Category     *Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	TodayStock   float64   `gorm:"-" json:"today_stock"`
}

func (Product) TableName() string {
	return "products"
}

type ProductListQuery struct {
	CategoryID uint64 `query:"category_id"`
	Keyword    string `query:"keyword"`
	Page       int    `query:"page"`
	PageSize   int    `query:"page_size"`
}

type ProductCreateRequest struct {
	CategoryID  uint64  `json:"category_id" validate:"required"`
	Name        string  `json:"name" validate:"required"`
	Description string  `json:"description"`
	ImageURL    string  `json:"image_url"`
	PriceUnit   string  `json:"price_unit" validate:"required,oneof=weight piece"`
	Price       float64 `json:"price" validate:"required,gt=0"`
	UnitWeight  float64 `json:"unit_weight"`
	Origin      string  `json:"origin"`
	Status      string  `json:"status"`
	Sort        int     `json:"sort"`
}

type ProductUpdateRequest struct {
	CategoryID  uint64  `json:"category_id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	ImageURL    string  `json:"image_url"`
	PriceUnit   string  `json:"price_unit"`
	Price       float64 `json:"price"`
	UnitWeight  float64 `json:"unit_weight"`
	Origin      string  `json:"origin"`
	Status      string  `json:"status"`
	Sort        int     `json:"sort"`
}
