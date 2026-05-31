package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID          uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Username    string         `gorm:"type:varchar(64);not null;uniqueIndex:idx_username" json:"username"`
	Password    string         `gorm:"type:varchar(256);not null" json:"-"`
	RealName    string         `gorm:"type:varchar(64);default:''" json:"real_name"`
	Phone       string         `gorm:"type:varchar(20);default:''" json:"phone"`
	Email       string         `gorm:"type:varchar(128);default:''" json:"email"`
	Role        int8           `gorm:"type:tinyint;not null;default:0" json:"role"`
	Status      int8           `gorm:"type:tinyint;not null;default:1" json:"status"`
	LastLoginAt *time.Time     `gorm:"type:datetime" json:"last_login_at"`
	CreatedAt   time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"type:datetime;index:idx_deleted_at" json:"deleted_at"`
}
