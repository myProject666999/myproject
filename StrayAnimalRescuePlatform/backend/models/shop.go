package models

import (
	"time"
)

type Shop struct {
	ID          uint       `gorm:"primary_key" json:"id"`
	Name        string     `gorm:"not null" json:"name"`
	Description string     `json:"description"`
	Address     string     `json:"address"`
	Phone       string     `json:"phone"`
	Images      string     `json:"images"`
	CoverImage  string     `json:"cover_image"`
	Status      int        `gorm:"default:1" json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `sql:"index" json:"-"`
}

type Boarding struct {
	ID          uint       `gorm:"primary_key" json:"id"`
	ShopID      uint       `json:"shop_id"`
	Shop        Shop       `gorm:"foreignKey:ShopID" json:"shop"`
	UserID      uint       `json:"user_id"`
	User        User       `gorm:"foreignKey:UserID" json:"user"`
	PetName     string     `json:"pet_name"`
	PetType     string     `json:"pet_type"`
	PetAge      string     `json:"pet_age"`
	StartDate   time.Time  `json:"start_date"`
	EndDate     time.Time  `json:"end_date"`
	Description string     `json:"description"`
	Status      string     `gorm:"default:'pending'" json:"status"`
	Remark      string     `json:"remark"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `sql:"index" json:"-"`
}
