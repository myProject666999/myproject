package model

import (
	"time"

	"gorm.io/gorm"
)

type MediaFile struct {
	ID               uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskID           uint64         `gorm:"type:bigint unsigned;not null;index:idx_task_id" json:"task_id"`
	FileName         string         `gorm:"type:varchar(256);not null" json:"file_name"`
	FileType         int8           `gorm:"type:tinyint;not null;default:0;index:idx_file_type" json:"file_type"`
	MimeType         string         `gorm:"type:varchar(64);default:''" json:"mime_type"`
	FileSize         uint64         `gorm:"type:bigint unsigned;not null;default:0" json:"file_size"`
	StoragePath      string         `gorm:"type:varchar(512);not null" json:"storage_path"`
	ThumbnailPath    string         `gorm:"type:varchar(512);default:''" json:"thumbnail_path"`
	FileHash         string         `gorm:"type:varchar(64);default:'';index:idx_file_hash" json:"file_hash"`
	Width            int            `gorm:"type:int;default:0" json:"width"`
	Height           int            `gorm:"type:int;default:0" json:"height"`
	Duration         float64        `gorm:"type:double;default:0" json:"duration"`
	CaptureLng       *float64       `gorm:"type:double" json:"capture_lng"`
	CaptureLat       *float64       `gorm:"type:double" json:"capture_lat"`
	CaptureAltitude  float64        `gorm:"type:double;default:0" json:"capture_altitude"`
	CaptureHeading   float64        `gorm:"type:double;default:0" json:"capture_heading"`
	CaptureGimbalPitch float64     `gorm:"type:double;default:-90" json:"capture_gimbal_pitch"`
	CaptureTime      *time.Time     `gorm:"type:datetime;index:idx_capture_time" json:"capture_time"`
	RoutePointID     *uint64        `gorm:"type:bigint unsigned" json:"route_point_id"`
	UploadStatus     int8           `gorm:"type:tinyint;not null;default:0;index:idx_upload_status" json:"upload_status"`
	ChunkCount       int            `gorm:"type:int;default:0" json:"chunk_count"`
	UploadedChunks   string         `gorm:"type:varchar(1024);default:''" json:"uploaded_chunks"`
	ArchivedAt       *time.Time     `gorm:"type:datetime" json:"archived_at"`
	CreatedAt        time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt        time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"type:datetime;index:idx_deleted_at" json:"deleted_at"`
}

type UploadChunk struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UploadID    string    `gorm:"type:varchar(64);not null;uniqueIndex:idx_upload_chunk;index:idx_upload_id" json:"upload_id"`
	FileName    string    `gorm:"type:varchar(256);not null" json:"file_name"`
	ChunkIndex uint      `gorm:"type:int unsigned;not null;uniqueIndex:idx_upload_chunk" json:"chunk_index"`
	ChunkHash   string    `gorm:"type:varchar(64);default:''" json:"chunk_hash"`
	ChunkSize   uint64    `gorm:"type:bigint unsigned;not null;default:0" json:"chunk_size"`
	StoragePath string    `gorm:"type:varchar(512);not null" json:"storage_path"`
	CreatedAt   time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
}
