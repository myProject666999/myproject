package models

import (
	"time"

	"gorm.io/gorm"
)

type Trip struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null;size:200"`
	Description string         `json:"description" gorm:"size:1000"`
	StartDate   time.Time      `json:"start_date"`
	EndDate     time.Time      `json:"end_date"`
	Status      string         `json:"status" gorm:"size:20;default:'draft'"`
	ShareToken  string         `json:"share_token" gorm:"uniqueIndex;size:64"`
	Days        []Day          `json:"days" gorm:"foreignKey:TripID"`
	Budgets     []Budget       `json:"budgets" gorm:"foreignKey:TripID"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

func (Trip) TableName() string {
	return "trips"
}
