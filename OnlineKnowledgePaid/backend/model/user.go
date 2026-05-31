package model

import "time"

type User struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Username     string    `gorm:"size:64;uniqueIndex;not null" json:"username"`
	Email        string    `gorm:"size:128;uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	Role         int8      `gorm:"not null;default:1" json:"role"`
	Avatar       string    `gorm:"size:512" json:"avatar"`
	Bio          string    `gorm:"size:512" json:"bio"`
	Status       int8      `gorm:"not null;default:1" json:"status"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}
