package models

import (
	"time"

	"github.com/jinzhu/gorm"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	Username  string     `gorm:"unique;not null" json:"username"`
	Password  string     `gorm:"not null" json:"-"`
	Email     string     `gorm:"unique;not null" json:"email"`
	Phone     string     `json:"phone"`
	Nickname  string     `json:"nickname"`
	Avatar    string     `json:"avatar"`
	Role      string     `gorm:"default:'user'" json:"role"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}

func (u *User) BeforeSave(tx *gorm.DB) error {
	if u.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.Password = string(hashedPassword)
	}
	return nil
}

func (u *User) ComparePassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}
