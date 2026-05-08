package models

import (
	"gorm.io/gorm"
	"time"
)

type RegistrationStatus string

const (
	RegRegistered RegistrationStatus = "registered"
	RegAttended   RegistrationStatus = "attended"
	RegCompleted  RegistrationStatus = "completed"
	RegCancelled  RegistrationStatus = "cancelled"
)

type Registration struct {
	ID         uint                 `json:"id" gorm:"primaryKey"`
	UserID     uint                 `json:"user_id" gorm:"not null;index"`
	ActivityID uint                 `json:"activity_id" gorm:"not null;index"`
	Status     RegistrationStatus   `json:"status" gorm:"type:varchar(20);default:'registered'"`
	Points     int                  `json:"points" gorm:"default:0"`
	Remark     string               `json:"remark" gorm:"size:255"`
	CreatedAt  time.Time            `json:"created_at"`
	UpdatedAt  time.Time            `json:"updated_at"`
	DeletedAt  gorm.DeletedAt       `json:"-" gorm:"index"`
	
	User       User                 `json:"user" gorm:"foreignKey:UserID"`
	Activity   Activity             `json:"activity" gorm:"foreignKey:ActivityID"`
}
