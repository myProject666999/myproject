package models

import (
	"time"
)

type TaskStatus string

const (
	StatusPending     TaskStatus = "pending"
	StatusProcessing  TaskStatus = "processing"
	StatusCompleted   TaskStatus = "completed"
	StatusFailed      TaskStatus = "failed"
)

type Task struct {
	ID           uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	FileName     string     `gorm:"size:255;not null" json:"file_name"`
	FilePath     string     `gorm:"size:512;not null" json:"file_path"`
	FileSize     uint64     `gorm:"default:0" json:"file_size"`
	OutputFormat string     `gorm:"size:16;not null" json:"output_format"`
	Status       TaskStatus `gorm:"size:16;not null;default:pending" json:"status"`
	Progress     uint8      `gorm:"default:0" json:"progress"`
	OutputPath   string     `gorm:"size:512" json:"output_path"`
	OutputSize   uint64     `gorm:"default:0" json:"output_size"`
	ErrorMessage string     `gorm:"type:text" json:"error_message,omitempty"`
	RetryCount   uint8      `gorm:"default:0" json:"retry_count"`
	MaxRetries   uint8      `gorm:"default:3" json:"max_retries"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

func (Task) TableName() string {
	return "tasks"
}

type TaskHistory struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskID    uint64    `gorm:"not null" json:"task_id"`
	Action    string    `gorm:"size:32;not null" json:"action"`
	Detail    string    `gorm:"type:text" json:"detail,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

func (TaskHistory) TableName() string {
	return "task_history"
}
