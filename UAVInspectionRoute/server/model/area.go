package model

import (
	"time"

	"gorm.io/gorm"
)

type InspectionArea struct {
	ID              uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Name            string         `gorm:"type:varchar(128);not null" json:"name"`
	AreaType        int8           `gorm:"type:tinyint;not null;default:0;index:idx_area_type" json:"area_type"`
	BoundaryPolygon string         `gorm:"type:json;not null" json:"boundary_polygon"`
	CenterLng       float64        `gorm:"type:double;not null" json:"center_lng"`
	CenterLat       float64        `gorm:"type:double;not null" json:"center_lat"`
	Description     string         `gorm:"type:varchar(512);default:''" json:"description"`
	CreatedBy       uint64         `gorm:"type:bigint unsigned;default:0" json:"created_by"`
	CreatedAt       time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;index:idx_created_at" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"type:datetime;index:idx_deleted_at" json:"deleted_at"`
}
