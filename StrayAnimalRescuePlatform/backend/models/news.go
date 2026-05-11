package models

import (
	"time"
)

type News struct {
	ID          uint       `gorm:"primary_key" json:"id"`
	Title       string     `gorm:"not null" json:"title"`
	Summary     string     `json:"summary"`
	Content     string     `json:"content"`
	CoverImage  string     `json:"cover_image"`
	Images      string     `json:"images"`
	Views       int        `gorm:"default:0" json:"views"`
	Status      int        `gorm:"default:1" json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `sql:"index" json:"-"`
}
