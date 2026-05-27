package models

import (
	"path/filepath"
	"strings"
	"time"
)

type File struct {
	ID             uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskID         *uint64   `gorm:"index" json:"task_id"`
	Name           string    `gorm:"size:255;not null" json:"name"`
	Path           string    `gorm:"size:500;not null;index" json:"path"`
	Size           uint64    `gorm:"default:0" json:"size"`
	Extension      string    `gorm:"size:20" json:"extension"`
	MimeType       string    `gorm:"size:100" json:"mime_type"`
	IsVideo        int8      `gorm:"default:0;index" json:"is_video"`
	IsAudio        int8      `gorm:"default:0" json:"is_audio"`
	IsImage        int8      `gorm:"default:0" json:"is_image"`
	ThumbnailPath  string    `gorm:"size:500" json:"thumbnail_path"`
	Duration       uint      `gorm:"default:0" json:"duration"`
	Downloaded     int8      `gorm:"default:1" json:"downloaded"`
	CreatedAt      time.Time `gorm:"autoCreateTime;index" json:"created_at"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	Task *DownloadTask `gorm:"-" json:"task,omitempty"`
}

func (File) TableName() string {
	return "files"
}

var videoExtensions = map[string]bool{
	".mp4": true, ".mkv": true, ".avi": true, ".mov": true, ".wmv": true,
	".flv": true, ".webm": true, ".m4v": true, ".mpeg": true, ".mpg": true,
	".3gp": true, ".ts": true, ".rmvb": true, ".rm": true, ".asf": true,
}

var audioExtensions = map[string]bool{
	".mp3": true, ".wav": true, ".flac": true, ".aac": true, ".ogg": true,
	".wma": true, ".m4a": true, ".ape": true, ".opus": true, ".amr": true,
}

var imageExtensions = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".bmp": true,
	".webp": true, ".svg": true, ".tiff": true, ".ico": true,
}

func (f *File) AutoDetectType() {
	ext := strings.ToLower(filepath.Ext(f.Name))
	f.Extension = ext

	if videoExtensions[ext] {
		f.IsVideo = 1
		f.MimeType = "video/" + strings.TrimPrefix(ext, ".")
	} else if audioExtensions[ext] {
		f.IsAudio = 1
		f.MimeType = "audio/" + strings.TrimPrefix(ext, ".")
	} else if imageExtensions[ext] {
		f.IsImage = 1
		f.MimeType = "image/" + strings.TrimPrefix(ext, ".")
	} else {
		f.MimeType = "application/octet-stream"
	}
}

func (f *File) IsPlayable() bool {
	return f.IsVideo == 1 || f.IsAudio == 1
}
