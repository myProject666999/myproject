package models

import "time"

type Enrollment struct {
	ID            uint64    `gorm:"primaryKey;column:id" json:"id"`
	UserID        uint64    `gorm:"not null;uniqueIndex:uk_user_course;column:user_id" json:"user_id"`
	CourseID      uint64    `gorm:"not null;uniqueIndex:uk_user_course;index:idx_course_id;column:course_id" json:"course_id"`
	PricePaid     float64   `gorm:"type:decimal(10,2);default:0.00;not null;column:price_paid" json:"price_paid"`
	PaymentStatus uint8     `gorm:"default:0;not null;column:payment_status" json:"payment_status"`
	EnrolledAt    time.Time `gorm:"column:enrolled_at" json:"enrolled_at"`
	CompletedAt   *time.Time `gorm:"column:completed_at" json:"completed_at"`
	CreatedAt     time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt     time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (Enrollment) TableName() string { return "enrollments" }

type LearningProgress struct {
	ID              uint64    `gorm:"primaryKey;column:id" json:"id"`
	UserID          uint64    `gorm:"not null;uniqueIndex:uk_user_lesson;index:idx_user_course;column:user_id" json:"user_id"`
	CourseID        uint64    `gorm:"not null;uniqueIndex:uk_user_lesson;index:idx_user_course;column:course_id" json:"course_id"`
	LessonID        uint64    `gorm:"not null;uniqueIndex:uk_user_lesson;column:lesson_id" json:"lesson_id"`
	Progress        uint      `gorm:"default:0;not null;column:progress" json:"progress"`
	LastPosition    uint      `gorm:"default:0;not null;column:last_position" json:"last_position"`
	TotalWatchTime  uint      `gorm:"default:0;not null;column:total_watch_time" json:"total_watch_time"`
	IsCompleted     bool      `gorm:"default:false;not null;index:idx_is_completed;column:is_completed" json:"is_completed"`
	CompletedAt     *time.Time `gorm:"column:completed_at" json:"completed_at"`
	LastWatchAt     *time.Time `gorm:"column:last_watch_at" json:"last_watch_at"`
	CreatedAt       time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt       time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (LearningProgress) TableName() string { return "learning_progress" }
