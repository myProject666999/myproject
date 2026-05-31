package model

import (
	"time"

	"gorm.io/gorm"
)

type Report struct {
	ID             uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Title          string         `gorm:"type:varchar(128);not null" json:"title"`
	TaskID         uint64         `gorm:"type:bigint unsigned;not null;index:idx_task_id" json:"task_id"`
	AreaID         uint64         `gorm:"type:bigint unsigned;not null;index:idx_area_id" json:"area_id"`
	ReportType     int8           `gorm:"type:tinyint;not null;default:0;index:idx_report_type" json:"report_type"`
	TotalMedia     int            `gorm:"type:int;default:0" json:"total_media"`
	TotalAnnotations int          `gorm:"type:int;default:0" json:"total_annotations"`
	CriticalCount  int            `gorm:"type:int;default:0" json:"critical_count"`
	SevereCount    int            `gorm:"type:int;default:0" json:"severe_count"`
	NormalCount    int            `gorm:"type:int;default:0" json:"normal_count"`
	InfoCount      int            `gorm:"type:int;default:0" json:"info_count"`
	FlightDuration int            `gorm:"type:int;default:0" json:"flight_duration"`
	FlightDistance float64        `gorm:"type:double;default:0" json:"flight_distance"`
	CoverageArea   float64        `gorm:"type:double;default:0" json:"coverage_area"`
	Content        *string        `gorm:"type:json" json:"content"`
	FilePath       string         `gorm:"type:varchar(512);default:''" json:"file_path"`
	Status         int8           `gorm:"type:tinyint;not null;default:0;index:idx_status" json:"status"`
	ReviewedBy     *uint64        `gorm:"type:bigint unsigned" json:"reviewed_by"`
	ReviewedAt     *time.Time     `gorm:"type:datetime" json:"reviewed_at"`
	CreatedBy      uint64         `gorm:"type:bigint unsigned;default:0" json:"created_by"`
	CreatedAt      time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP;index:idx_created_at" json:"created_at"`
	UpdatedAt      time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"type:datetime;index:idx_deleted_at" json:"deleted_at"`
}
