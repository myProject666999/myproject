package models

import (
	"gorm.io/gorm"
	"time"
)

type ActivityStatus string

const (
	ActivityPending    ActivityStatus = "pending"
	ActivityActive     ActivityStatus = "active"
	ActivityOngoing    ActivityStatus = "ongoing"
	ActivityCompleted  ActivityStatus = "completed"
	ActivityCancelled  ActivityStatus = "cancelled"
)

type Activity struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	Title           string         `json:"title" gorm:"not null;size:200"`
	Description     string         `json:"description" gorm:"type:text"`
	Location        string         `json:"location" gorm:"size:200"`
	StartDate       time.Time      `json:"start_date"`
	EndDate         time.Time      `json:"end_date"`
	MaxParticipants int            `json:"max_participants"`
	CurrentParticipants int        `json:"current_participants" gorm:"default:0"`
	Points          int            `json:"points" gorm:"default:10"`
	Category        string         `json:"category" gorm:"size:50"`
	CoverImage      string         `json:"cover_image" gorm:"size:255"`
	Status          ActivityStatus `json:"status" gorm:"type:varchar(20);default:'pending'"`
	CreatedBy       uint           `json:"created_by"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
	
	Registrations   []Registration `json:"-" gorm:"foreignKey:ActivityID"`
	Comments        []Comment      `json:"-" gorm:"foreignKey:ActivityID"`
}
