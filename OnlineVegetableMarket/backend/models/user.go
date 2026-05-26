package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint64         `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	Username  string         `gorm:"column:username;size:50;uniqueIndex;not null" json:"username"`
	Password  string         `gorm:"column:password;size:255;not null" json:"-"`
	Phone     string         `gorm:"column:phone;size:20;not null" json:"phone"`
	Address   string         `gorm:"column:address;size:500" json:"address"`
	Role      string         `gorm:"column:role;type:enum('customer','merchant','admin');default:customer" json:"role"`
	CreatedAt time.Time      `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
}

func (User) TableName() string {
	return "users"
}

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Password string `json:"password" validate:"required,min=6"`
	Phone    string `json:"phone" validate:"required"`
	Address  string `json:"address"`
}

type UserResponse struct {
	ID        uint64    `json:"id"`
	Username  string    `json:"username"`
	Phone     string    `json:"phone"`
	Address   string    `json:"address"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Username:  u.Username,
		Phone:     u.Phone,
		Address:   u.Address,
		Role:      u.Role,
		CreatedAt: u.CreatedAt,
	}
}
