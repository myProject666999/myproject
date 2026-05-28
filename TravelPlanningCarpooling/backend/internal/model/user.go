package model

import "time"

type User struct {
	ID             uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Phone          string    `gorm:"type:varchar(20);uniqueIndex" json:"phone"`
	Password       string    `gorm:"type:varchar(255)" json:"-"`
	Nickname       string    `gorm:"type:varchar(50)" json:"nickname"`
	Avatar         string    `gorm:"type:varchar(255)" json:"avatar"`
	Gender         int       `gorm:"default:0" json:"gender"`
	CreditScore    int       `gorm:"default:100" json:"credit_score"`
	TotalRides     int       `gorm:"default:0" json:"total_rides"`
	CompletedRides int       `gorm:"default:0" json:"completed_rides"`
	Role           int       `gorm:"default:1" json:"role"`
	RealName       string    `gorm:"type:varchar(50)" json:"real_name"`
	IDCard         string    `gorm:"type:varchar(20)" json:"id_card"`
	IsVerified     int       `gorm:"default:0" json:"is_verified"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}

type LoginRequest struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
	Nickname string `json:"nickname" binding:"required"`
}

type UserResponse struct {
	ID             uint64 `json:"id"`
	Phone          string `json:"phone"`
	Nickname       string `json:"nickname"`
	Avatar         string `json:"avatar"`
	Gender         int    `json:"gender"`
	CreditScore    int    `json:"credit_score"`
	TotalRides     int    `json:"total_rides"`
	CompletedRides int    `json:"completed_rides"`
	Role           int    `json:"role"`
	IsVerified     int    `json:"is_verified"`
	Token          string `json:"token,omitempty"`
}
