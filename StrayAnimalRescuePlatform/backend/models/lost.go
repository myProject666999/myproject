package models

import (
	"time"
)

type LostPet struct {
	ID          uint       `gorm:"primary_key" json:"id"`
	UserID      uint       `json:"user_id"`
	User        User       `gorm:"foreignKey:UserID" json:"user"`
	Name        string     `json:"name"`
	Breed       string     `json:"breed"`
	Age         string     `json:"age"`
	Gender      string     `json:"gender"`
	Description string     `json:"description"`
	LostDate    time.Time  `json:"lost_date"`
	LostLocation string    `json:"lost_location"`
	ContactPhone string     `json:"contact_phone"`
	ContactName  string     `json:"contact_name"`
	Images      string     `json:"images"`
	CoverImage  string     `json:"cover_image"`
	Found       bool       `gorm:"default:false" json:"found"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `sql:"index" json:"-"`
}
