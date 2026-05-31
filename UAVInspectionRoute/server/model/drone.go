package model

import (
	"time"

	"gorm.io/gorm"
)

type Drone struct {
	ID            uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Name          string         `gorm:"type:varchar(128);not null" json:"name"`
	SN            string         `gorm:"type:varchar(64);not null;uniqueIndex:idx_sn" json:"sn"`
	Model         string         `gorm:"type:varchar(64);default:''" json:"model"`
	MaxFlightTime int            `gorm:"type:int;default:30" json:"max_flight_time"`
	MaxAltitude   float64        `gorm:"type:double;default:120" json:"max_altitude"`
	MaxSpeed      float64        `gorm:"type:double;default:15" json:"max_speed"`
	CameraType    string         `gorm:"type:varchar(64);default:''" json:"camera_type"`
	Status        int8           `gorm:"type:tinyint;not null;default:0;index:idx_status" json:"status"`
	LastSeenAt    *time.Time     `gorm:"type:datetime" json:"last_seen_at"`
	CreatedAt     time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt     time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"type:datetime;index:idx_deleted_at" json:"deleted_at"`
}
