package model

import (
	"time"

	"gorm.io/gorm"
)

type Route struct {
	ID               uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Name             string         `gorm:"type:varchar(128);not null" json:"name"`
	AreaID           uint64         `gorm:"type:bigint unsigned;not null;index:idx_area_id" json:"area_id"`
	RouteType        int8           `gorm:"type:tinyint;not null;default:0" json:"route_type"`
	Altitude         float64        `gorm:"type:double;not null;default:50" json:"altitude"`
	Speed            float64        `gorm:"type:double;not null;default:5" json:"speed"`
	OverlapRate      float64        `gorm:"type:double;not null;default:70" json:"overlap_rate"`
	SideOverlapRate  float64        `gorm:"type:double;not null;default:60" json:"side_overlap_rate"`
	CameraAngle      float64        `gorm:"type:double;not null;default:90" json:"camera_angle"`
	TotalDistance    float64        `gorm:"type:double;default:0" json:"total_distance"`
	EstimatedDuration int           `gorm:"type:int;default:0" json:"estimated_duration"`
	Description      string         `gorm:"type:varchar(512);default:''" json:"description"`
	CreatedBy        uint64         `gorm:"type:bigint unsigned;default:0" json:"created_by"`
	CreatedAt        time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;index:idx_created_at" json:"created_at"`
	UpdatedAt        time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"type:datetime;index:idx_deleted_at" json:"deleted_at"`

	Points []RoutePoint `gorm:"foreignKey:RouteID" json:"points,omitempty"`
}

type RoutePoint struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	RouteID     uint64    `gorm:"type:bigint unsigned;not null;index:idx_route_id;uniqueIndex:idx_route_seq" json:"route_id"`
	SeqNum      uint      `gorm:"type:int unsigned;not null;uniqueIndex:idx_route_seq" json:"seq_num"`
	Lng         float64   `gorm:"type:double;not null" json:"lng"`
	Lat         float64   `gorm:"type:double;not null" json:"lat"`
	Altitude    float64   `gorm:"type:double;not null;default:50" json:"altitude"`
	Speed       float64   `gorm:"type:double;default:0" json:"speed"`
	PointType   int8      `gorm:"type:tinyint;not null;default:0" json:"point_type"`
	Action      int8      `gorm:"type:tinyint;default:0" json:"action"`
	Heading     float64   `gorm:"type:double;default:0" json:"heading"`
	GimbalPitch float64   `gorm:"type:double;default:-90" json:"gimbal_pitch"`
	HoverTime   int       `gorm:"type:int;default:0" json:"hover_time"`
	CreatedAt   time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
}
