package models

import (
	"gorm.io/gorm"
	"time"
)

type Carousel struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Title     string         `json:"title" gorm:"size:100"`
	ImageURL  string         `json:"image_url" gorm:"not null;size:255"`
	Link      string         `json:"link" gorm:"size:255"`
	Sort      int            `json:"sort" gorm:"default:0"`
	Status    string         `json:"status" gorm:"type:varchar(20);default:'active'"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}
