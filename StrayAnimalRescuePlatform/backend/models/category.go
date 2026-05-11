package models

import (
	"time"
)

type PetCategory struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Name      string     `gorm:"unique;not null" json:"name"`
	Description string   `json:"description"`
	Sort      int        `gorm:"default:0" json:"sort"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

type ProductCategory struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Name      string     `gorm:"unique;not null" json:"name"`
	Description string   `json:"description"`
	Sort      int        `gorm:"default:0" json:"sort"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}
