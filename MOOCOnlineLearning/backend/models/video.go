package models

import "time"

type Video struct {
	ID              uint64    `gorm:"primaryKey;column:id" json:"id"`
	FileName        string    `gorm:"size:255;not null;column:file_name" json:"file_name"`
	FileSize        uint64    `gorm:"default:0;not null;column:file_size" json:"file_size"`
	Duration        uint      `gorm:"default:0;not null;column:duration" json:"duration"`
	StorageKey      string    `gorm:"size:500;not null;index:idx_storage_key;column:storage_key" json:"storage_key"`
	StorageProvider string    `gorm:"size:50;not null;default:aliyun;column:storage_provider" json:"storage_provider"`
	CdnURL          string    `gorm:"size:500;column:cdn_url" json:"cdn_url"`
	CoverURL        string    `gorm:"size:500;column:cover_url" json:"cover_url"`
	Resolution      string    `gorm:"size:50;column:resolution" json:"resolution"`
	Format          string    `gorm:"size:20;not null;default:mp4;column:format" json:"format"`
	MimeType        string    `gorm:"size:50;column:mime_type" json:"mime_type"`
	UploadStatus    uint8     `gorm:"default:0;not null;index:idx_upload_status;column:upload_status" json:"upload_status"`
	UploadedAt      *time.Time `gorm:"column:uploaded_at" json:"uploaded_at"`
	CreatedAt       time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt       time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (Video) TableName() string { return "videos" }

type VideoChunk struct {
	ID           uint64    `gorm:"primaryKey;column:id" json:"id"`
	VideoID      uint64    `gorm:"index:idx_video_id;not null;uniqueIndex:uk_video_chunk;column:video_id" json:"video_id"`
	ChunkIndex   uint      `gorm:"not null;uniqueIndex:uk_video_chunk;column:chunk_index" json:"chunk_index"`
	ChunkSize    uint64    `gorm:"not null;column:chunk_size" json:"chunk_size"`
	StorageKey   string    `gorm:"size:500;not null;column:storage_key" json:"storage_key"`
	Md5          string    `gorm:"size:64;column:md5" json:"md5"`
	UploadStatus uint8     `gorm:"default:0;not null;column:upload_status" json:"upload_status"`
	CreatedAt    time.Time `gorm:"column:created_at" json:"created_at"`
}

func (VideoChunk) TableName() string { return "video_chunks" }

type VideoToken struct {
	ID        uint64    `gorm:"primaryKey;column:id" json:"id"`
	VideoID   uint64    `gorm:"index:idx_video_user;not null;column:video_id" json:"video_id"`
	UserID    uint64    `gorm:"index:idx_video_user;not null;column:user_id" json:"user_id"`
	Token     string    `gorm:"size:255;not null;index:idx_token;column:token" json:"token"`
	ExpireAt  time.Time `gorm:"index:idx_expire_at;not null;column:expire_at" json:"expire_at"`
	ClientIP  string    `gorm:"size:50;column:client_ip" json:"client_ip"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
}

func (VideoToken) TableName() string { return "video_tokens" }
