package models

import (
	"time"
)

type Product struct {
	ID                uint       `gorm:"primary_key" json:"id"`
	Name              string     `gorm:"not null" json:"name"`
	ProductCategoryID uint       `json:"product_category_id"`
	ProductCategory   ProductCategory `gorm:"foreignKey:ProductCategoryID" json:"product_category"`
	Description       string     `json:"description"`
	Content           string     `json:"content"`
	Price             float64    `gorm:"type:decimal(10,2);not null" json:"price"`
	OriginalPrice     float64    `gorm:"type:decimal(10,2)" json:"original_price"`
	Stock             int        `gorm:"default:0" json:"stock"`
	Sales             int        `gorm:"default:0" json:"sales"`
	Images            string     `json:"images"`
	CoverImage        string     `json:"cover_image"`
	Status            int        `gorm:"default:1" json:"status"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	DeletedAt         *time.Time `sql:"index" json:"-"`
}
