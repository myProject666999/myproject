package models

import "time"

type StudyNote struct {
	ID        uint64    `gorm:"primaryKey;column:id" json:"id"`
	UserID    uint64    `gorm:"index:idx_user_id;not null;column:user_id" json:"user_id"`
	CourseID  uint64    `gorm:"index:idx_course_id;not null;column:course_id" json:"course_id"`
	LessonID  uint64    `gorm:"index:idx_lesson_id;not null;column:lesson_id" json:"lesson_id"`
	Timestamp *uint     `gorm:"column:timestamp" json:"timestamp"`
	Content   string    `gorm:"type:text;not null;column:content" json:"content"`
	IsPublic  bool      `gorm:"default:false;not null;column:is_public" json:"is_public"`
	LikeCount uint      `gorm:"default:0;not null;column:like_count" json:"like_count"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (StudyNote) TableName() string { return "study_notes" }

type OperationLog struct {
	ID            uint64    `gorm:"primaryKey;column:id" json:"id"`
	UserID        *uint64   `gorm:"index:idx_user_id;column:user_id" json:"user_id"`
	Module        string    `gorm:"size:50;index:idx_module;not null;column:module" json:"module"`
	Operation     string    `gorm:"size:50;not null;column:operation" json:"operation"`
	Method        string    `gorm:"size:200;column:method" json:"method"`
	RequestParams string    `gorm:"type:text;column:request_params" json:"request_params"`
	IP            string    `gorm:"size:50;column:ip" json:"ip"`
	Status        uint8     `gorm:"default:0;not null;column:status" json:"status"`
	ErrorMsg      string    `gorm:"size:500;column:error_msg" json:"error_msg"`
	CostTime      *uint     `gorm:"column:cost_time" json:"cost_time"`
	CreatedAt     time.Time `gorm:"index:idx_created_at;column:created_at" json:"created_at"`
}

func (OperationLog) TableName() string { return "operation_logs" }
