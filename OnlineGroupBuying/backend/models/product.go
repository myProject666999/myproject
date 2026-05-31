package models

import "time"

type Product struct {
	ID            uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Name          string    `json:"name" gorm:"size:200;not null"`
	Description   string    `json:"description" gorm:"type:text;not null"`
	Images        string    `json:"images" gorm:"size:1024;not null;default:''"`
	OriginalPrice float64   `json:"original_price" gorm:"not null;default:0"`
	Stock         int       `json:"stock" gorm:"not null;default:0"`
	Status        int       `json:"status" gorm:"not null;default:1;comment:0下架,1上架"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (Product) TableName() string {
	return "products"
}
