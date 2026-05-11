package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	LoginName    string         `json:"login_name" gorm:"uniqueIndex;size:50"`
	Password     string         `json:"-" gorm:"size:255"`
	Name         string         `json:"name" gorm:"size:50"`
	Role         string         `json:"role" gorm:"size:20"`
	Phone        string         `json:"phone" gorm:"size:20"`
	Email        string         `json:"email" gorm:"size:100"`
	Status       int            `json:"status" gorm:"default:1"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type Hospital struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Name         string         `json:"name" gorm:"size:100"`
	Address      string         `json:"address" gorm:"size:200"`
	Level        string         `json:"level" gorm:"size:20"`
	Phone        string         `json:"phone" gorm:"size:20"`
	Director     string         `json:"director" gorm:"size:50"`
	Capacity     int            `json:"capacity"`
	Status       int            `json:"status" gorm:"default:1"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type Manufacturer struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Name         string         `json:"name" gorm:"size:100"`
	Address      string         `json:"address" gorm:"size:200"`
	Contact      string         `json:"contact" gorm:"size:50"`
	Phone        string         `json:"phone" gorm:"size:20"`
	Business     string         `json:"business" gorm:"size:200"`
	Status       int            `json:"status" gorm:"default:1"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type Volunteer struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	LoginName    string         `json:"login_name" gorm:"uniqueIndex;size:50"`
	Password     string         `json:"-" gorm:"size:255"`
	Name         string         `json:"name" gorm:"size:50"`
	Gender       string         `json:"gender" gorm:"size:10"`
	Age          int            `json:"age"`
	Phone        string         `json:"phone" gorm:"size:20"`
	Email        string         `json:"email" gorm:"size:100"`
	Address      string         `json:"address" gorm:"size:200"`
	Skills       string         `json:"skills" gorm:"size:200"`
	Status       int            `json:"status" gorm:"default:1"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type Activity struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Title        string         `json:"title" gorm:"size:200"`
	Description  string         `json:"description" gorm:"type:text"`
	Location     string         `json:"location" gorm:"size:200"`
	StartDate    string         `json:"start_date" gorm:"size:20"`
	EndDate      string         `json:"end_date" gorm:"size:20"`
	Organizer    string         `json:"organizer" gorm:"size:100"`
	MaxParticipants int         `json:"max_participants"`
	CurrentParticipants int     `json:"current_participants" gorm:"default:0"`
	Status       int            `json:"status" gorm:"default:1"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type Announcement struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Title        string         `json:"title" gorm:"size:200"`
	Content      string         `json:"content" gorm:"type:text"`
	Author       string         `json:"author" gorm:"size:50"`
	IsPublished  bool           `json:"is_published" gorm:"default:true"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type Finance struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Type         string         `json:"type" gorm:"size:10"`
	Amount       float64        `json:"amount"`
	Description  string         `json:"description" gorm:"size:200"`
	ReceiveDate  string         `json:"receive_date" gorm:"size:20"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

func (u *User) SetPassword(password string) error {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashed)
	return nil
}

func (u *User) ComparePassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

func (v *Volunteer) SetPassword(password string) error {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	v.Password = string(hashed)
	return nil
}

func (v *Volunteer) ComparePassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(v.Password), []byte(password))
	return err == nil
}
