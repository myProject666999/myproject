package models

import (
	"gorm.io/gorm"
	"time"
)

type Comment struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     uint           `json:"user_id" gorm:"not null;index"`
	ActivityID uint           `json:"activity_id" gorm:"not null;index"`
	Content    string         `json:"content" gorm:"type:text;not null"`
	Rating     int            `json:"rating" gorm:"default:5"`
	Status     string         `json:"status" gorm:"type:varchar(20);default:'active'"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
	
	User       User           `json:"user" gorm:"foreignKey:UserID"`
}
