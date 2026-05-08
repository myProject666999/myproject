package models

import (
	"gorm.io/gorm"
	"time"
)

type PointsRecord struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id" gorm:"not null;index"`
	ActivityID  uint           `json:"activity_id" gorm:"index"`
	Points      int            `json:"points" gorm:"not null"`
	Type        string         `json:"type" gorm:"type:varchar(20);default:'activity'"`
	Description string         `json:"description" gorm:"size:255"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}
