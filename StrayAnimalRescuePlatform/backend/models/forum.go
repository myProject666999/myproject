package models

import (
	"time"
)

type Post struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	UserID    uint       `json:"user_id"`
	User      User       `gorm:"foreignKey:UserID" json:"user"`
	Title     string     `gorm:"not null" json:"title"`
	Content   string     `json:"content"`
	Images    string     `json:"images"`
	Views     int        `gorm:"default:0" json:"views"`
	Likes     int        `gorm:"default:0" json:"likes"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

type Comment struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	PostID    uint       `json:"post_id"`
	Post      Post       `gorm:"foreignKey:PostID" json:"post"`
	UserID    uint       `json:"user_id"`
	User      User       `gorm:"foreignKey:UserID" json:"user"`
	Content   string     `gorm:"not null" json:"content"`
	Status    int        `gorm:"default:1" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}
