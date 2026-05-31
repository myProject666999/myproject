package models

import "time"

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Username  string    `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password  string    `json:"-" gorm:"size:255;not null"`
	Nickname  string    `json:"nickname" gorm:"size:50;not null;default:''"`
	Avatar    string    `json:"avatar" gorm:"size:255;not null;default:''"`
	Phone     string    `json:"phone" gorm:"size:20;not null;default:''"`
	Balance   float64   `json:"balance" gorm:"not null;default:0"`
	Role      int       `json:"role" gorm:"not null;default:0;comment:0普通用户,1管理员"`
	Status    int       `json:"status" gorm:"not null;default:1;comment:0禁用,1正常"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}
