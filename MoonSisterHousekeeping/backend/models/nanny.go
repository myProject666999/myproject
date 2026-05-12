package models

import "time"

type Nanny struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id"`
	Level       string    `json:"level" gorm:"size:20"`
	Experience  int       `json:"experience"`
	Age         int       `json:"age"`
	Status      string    `json:"status" gorm:"size:20"`
	Description string    `json:"description" gorm:"type:text"`
	VideoResume string    `json:"video_resume" gorm:"size:500"`
	Avatar      string    `json:"avatar" gorm:"size:255"`
	Rating      float64   `json:"rating" gorm:"default:5.0"`
	OrderCount  int       `json:"order_count" gorm:"default:0"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Skills      []SkillTag `json:"skills" gorm:"many2many:nanny_skills"`
}

type SkillTag struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	Name        string `json:"name" gorm:"uniqueIndex;size:50"`
	Description string `json:"description" gorm:"size:255"`
}

type NannySchedule struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	NannyID   uint      `json:"nanny_id"`
	Date      time.Time `json:"date"`
	Status    string    `json:"status" gorm:"size:20"`
	OrderID   uint      `json:"order_id"`
	CreatedAt time.Time `json:"created_at"`
}
