package models

import "time"

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"uniqueIndex;size:50"`
	Password  string    `json:"-" gorm:"size:255"`
	Name      string    `json:"name" gorm:"size:50"`
	Role      string    `json:"role" gorm:"size:20"`
	Phone     string    `json:"phone" gorm:"size:20"`
	Avatar    string    `json:"avatar" gorm:"size:255"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
