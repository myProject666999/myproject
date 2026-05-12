package models

import "time"

type Course struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"size:200"`
	Description string    `json:"description" gorm:"type:text"`
	Cover       string    `json:"cover" gorm:"size:500"`
	VideoUrl    string    `json:"video_url" gorm:"size:500"`
	Duration    int       `json:"duration"`
	Price       float64   `json:"price"`
	Category    string    `json:"category" gorm:"size:50"`
	Level       string    `json:"level" gorm:"size:20"`
	Teacher     string    `json:"teacher" gorm:"size:50"`
	ViewCount   int       `json:"view_count" gorm:"default:0"`
	Status      string    `json:"status" gorm:"size:20"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type LearningRecord struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	CourseID   uint      `json:"course_id"`
	UserID     uint      `json:"user_id"`
	Progress   int       `json:"progress" gorm:"default:0"`
	LastPosition int    `json:"last_position" gorm:"default:0"`
	IsCompleted bool     `json:"is_completed" gorm:"default:false"`
	CompletedAt *time.Time `json:"completed_at"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
