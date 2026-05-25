package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Username     string         `json:"username" gorm:"uniqueIndex;size:30;not null"`
	Password     string         `json:"-" gorm:"size:100;not null"`
	RealName     string         `json:"real_name" gorm:"size:50"`
	Phone        string         `json:"phone" gorm:"size:20"`
	Role         int            `json:"role" gorm:"default:1;comment:1-管理员 2-操作员"`
	Status       int            `json:"status" gorm:"default:1;comment:1-正常 2-禁用"`
	LastLoginTime *time.Time    `json:"last_login_time"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

func (User) TableName() string {
	return "users"
}
