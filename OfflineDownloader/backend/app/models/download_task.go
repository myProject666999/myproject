package models

import (
	"time"
)

const (
	TaskStatusWaiting   = 0
	TaskStatusDownloading = 1
	TaskStatusPaused    = 2
	TaskStatusCompleted = 3
	TaskStatusError     = 4
	TaskStatusDeleted   = 5

	TaskTypeHTTP   = 1
	TaskTypeMagnet = 2
	TaskTypeED2K   = 3
)

type DownloadTask struct {
	ID             uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskID         string     `gorm:"size:64;uniqueIndex;not null" json:"task_id"`
	Title          string     `gorm:"size:255" json:"title"`
	URL            string     `gorm:"type:text;not null" json:"url"`
	Type           int8       `gorm:"not null;default:1;index" json:"type"`
	Status         int8       `gorm:"not null;default:0;index" json:"status"`
	TotalSize      uint64     `gorm:"default:0" json:"total_size"`
	DownloadedSize uint64     `gorm:"default:0" json:"downloaded_size"`
	Speed          uint64     `gorm:"default:0" json:"speed"`
	Progress       float64    `gorm:"type:decimal(5,2);default:0.00" json:"progress"`
	FileCount      uint       `gorm:"default:0" json:"file_count"`
	SavePath       string     `gorm:"size:500" json:"save_path"`
	FileName       string     `gorm:"size:255" json:"file_name"`
	InfoHash       string     `gorm:"size:64" json:"info_hash"`
	ErrorMessage   string     `gorm:"size:500" json:"error_message"`
	CreatedAt      time.Time  `gorm:"autoCreateTime;index" json:"created_at"`
	UpdatedAt      time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	CompletedAt    *time.Time `json:"completed_at,omitempty"`
}

func (DownloadTask) TableName() string {
	return "download_tasks"
}

func (t *DownloadTask) GetStatusText() string {
	switch t.Status {
	case TaskStatusWaiting:
		return "等待中"
	case TaskStatusDownloading:
		return "下载中"
	case TaskStatusPaused:
		return "已暂停"
	case TaskStatusCompleted:
		return "已完成"
	case TaskStatusError:
		return "错误"
	case TaskStatusDeleted:
		return "已删除"
	default:
		return "未知"
	}
}

func (t *DownloadTask) GetTypeText() string {
	switch t.Type {
	case TaskTypeHTTP:
		return "HTTP"
	case TaskTypeMagnet:
		return "磁力链"
	case TaskTypeED2K:
		return "ED2K"
	default:
		return "未知"
	}
}
