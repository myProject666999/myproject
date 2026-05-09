package models

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password string `json:"-" gorm:"size:255;not null"`
	Role     string `json:"role" gorm:"size:20;not null"`
	Name     string `json:"name" gorm:"size:50"`
	Phone    string `json:"phone" gorm:"size:20"`
	Email    string `json:"email" gorm:"size:100"`
	Gender   string `json:"gender" gorm:"size:10"`
	Age      int    `json:"age"`
	Company  string `json:"company" gorm:"size:100"`
	Position string `json:"position" gorm:"size:50"`
	Status   int    `json:"status" gorm:"default:1"`
}

func (u *User) SetPassword(password string) error {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedBytes)
	return nil
}

func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}
