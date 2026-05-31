package model

import (
	"time"

	"gorm.io/gorm"
)

type Comparison struct {
	ID                 uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Title              string         `gorm:"type:varchar(128);not null" json:"title"`
	AreaID             uint64         `gorm:"type:bigint unsigned;not null;index:idx_area_id" json:"area_id"`
	BaseTaskID         uint64         `gorm:"type:bigint unsigned;not null;index:idx_base_task" json:"base_task_id"`
	CompareTaskID      uint64         `gorm:"type:bigint unsigned;not null;index:idx_compare_task" json:"compare_task_id"`
	ComparisonType     int8           `gorm:"type:tinyint;not null;default:0" json:"comparison_type"`
	Result             *string        `gorm:"type:json" json:"result"`
	NewAnnotations     int            `gorm:"type:int;default:0" json:"new_annotations"`
	ResolvedAnnotations int           `gorm:"type:int;default:0" json:"resolved_annotations"`
	ChangedAnnotations int            `gorm:"type:int;default:0" json:"changed_annotations"`
	SimilarityScore    float64        `gorm:"type:double;default:0" json:"similarity_score"`
	Description        string         `gorm:"type:varchar(512);default:''" json:"description"`
	CreatedBy          uint64         `gorm:"type:bigint unsigned;default:0" json:"created_by"`
	CreatedAt          time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt          time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"type:datetime;index:idx_deleted_at" json:"deleted_at"`
}
