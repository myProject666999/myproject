package models

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"time"
)

type UserRole string

const (
	RoleVolunteer UserRole = "volunteer"
	RoleAdmin     UserRole = "admin"
)

type User struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Username     string         `json:"username" gorm:"uniqueIndex;not null;size:50"`
	Password     string         `json:"-" gorm:"not null"`
	Email        string         `json:"email" gorm:"size:100"`
	Phone        string         `json:"phone" gorm:"size:20"`
	Role         UserRole       `json:"role" gorm:"type:varchar(20);default:'volunteer'"`
	RealName     string         `json:"real_name" gorm:"size:50"`
	Avatar       string         `json:"avatar" gorm:"size:255"`
	Points       int            `json:"points" gorm:"default:0"`
	College      string         `json:"college" gorm:"size:100"`
	Major        string         `json:"major" gorm:"size:100"`
	StudentID    string         `json:"student_id" gorm:"size:50"`
	Gender       string         `json:"gender" gorm:"size:10"`
	IsExcellent  bool           `json:"is_excellent" gorm:"default:false"`
	Status       string         `json:"status" gorm:"type:varchar(20);default:'active'"`
	ActivityCount int           `json:"activity_count" gorm:"default:0"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

func (u *User) HashPassword(password string) error {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		return err
	}
	u.Password = string(bytes)
	return nil
}

func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}
