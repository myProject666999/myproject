package model

import (
	"time"

	"gorm.io/gorm"
)

type Annotation struct {
	ID          uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	MediaID     uint64         `gorm:"type:bigint unsigned;not null;index:idx_media_id" json:"media_id"`
	TaskID      uint64         `gorm:"type:bigint unsigned;not null;index:idx_task_id" json:"task_id"`
	AreaID      uint64         `gorm:"type:bigint unsigned;not null;index:idx_area_id" json:"area_id"`
	Title       string         `gorm:"type:varchar(128);not null" json:"title"`
	Category    int8           `gorm:"type:tinyint;not null;default:0;index:idx_category" json:"category"`
	Severity    int8           `gorm:"type:tinyint;not null;default:0;index:idx_severity" json:"severity"`
	Description string         `gorm:"type:varchar(1024);default:''" json:"description"`
	ShapeType   int8           `gorm:"type:tinyint;not null;default:0" json:"shape_type"`
	ShapeData   string         `gorm:"type:json;not null" json:"shape_data"`
	XRatio      float64        `gorm:"type:double;default:0" json:"x_ratio"`
	YRatio      float64        `gorm:"type:double;default:0" json:"y_ratio"`
	WidthRatio  float64        `gorm:"type:double;default:0" json:"width_ratio"`
	HeightRatio float64        `gorm:"type:double;default:0" json:"height_ratio"`
	GeoLng      *float64       `gorm:"type:double;index:idx_geo" json:"geo_lng"`
	GeoLat      *float64       `gorm:"type:double;index:idx_geo" json:"geo_lat"`
	Status      int8           `gorm:"type:tinyint;not null;default:0;index:idx_status" json:"status"`
	AssignedTo  *uint64        `gorm:"type:bigint unsigned" json:"assigned_to"`
	ResolvedAt  *time.Time     `gorm:"type:datetime" json:"resolved_at"`
	Resolution  string         `gorm:"type:varchar(512);default:''" json:"resolution"`
	CreatedBy   uint64         `gorm:"type:bigint unsigned;default:0" json:"created_by"`
	CreatedAt   time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"type:datetime;index:idx_deleted_at" json:"deleted_at"`
}
