package model

import (
	"time"

	"gorm.io/gorm"
)

type NoFlyZone struct {
	ID              uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Name            string         `gorm:"type:varchar(128);not null" json:"name"`
	ZoneType        int8           `gorm:"type:tinyint;not null;default:0;index:idx_zone_type" json:"zone_type"`
	CenterLng       float64        `gorm:"type:double;not null" json:"center_lng"`
	CenterLat       float64        `gorm:"type:double;not null" json:"center_lat"`
	Radius          float64        `gorm:"type:double;not null;default:0" json:"radius"`
	BoundaryPolygon *string        `gorm:"type:json" json:"boundary_polygon"`
	MaxAltitude     float64        `gorm:"type:double;default:0" json:"max_altitude"`
	EffectiveFrom   *time.Time     `gorm:"type:datetime" json:"effective_from"`
	EffectiveTo     *time.Time     `gorm:"type:datetime" json:"effective_to"`
	Source          string         `gorm:"type:varchar(64);default:''" json:"source"`
	CreatedAt       time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"type:datetime;index:idx_deleted_at" json:"deleted_at"`
}
