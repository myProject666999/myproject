package model

import (
	"time"

	"gorm.io/gorm"
)

type Task struct {
	ID              uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Title           string         `gorm:"type:varchar(128);not null" json:"title"`
	AreaID          uint64         `gorm:"type:bigint unsigned;not null;index:idx_area_id" json:"area_id"`
	RouteID         uint64         `gorm:"type:bigint unsigned;not null;index:idx_route_id" json:"route_id"`
	DroneID         *uint64        `gorm:"type:bigint unsigned;index:idx_drone_id" json:"drone_id"`
	Status          int8           `gorm:"type:tinyint;not null;default:0;index:idx_status" json:"status"`
	Priority        int8           `gorm:"type:tinyint;not null;default:1" json:"priority"`
	InspectionType  int8           `gorm:"type:tinyint;not null;default:0" json:"inspection_type"`
	ScheduledAt     *time.Time     `gorm:"type:datetime;index:idx_scheduled_at" json:"scheduled_at"`
	StartedAt       *time.Time     `gorm:"type:datetime" json:"started_at"`
	CompletedAt     *time.Time     `gorm:"type:datetime" json:"completed_at"`
	ActualDuration  int            `gorm:"type:int;default:0" json:"actual_duration"`
	FlightDistance  float64        `gorm:"type:double;default:0" json:"flight_distance"`
	OperatorID      uint64         `gorm:"type:bigint unsigned;default:0" json:"operator_id"`
	ResultSummary   string         `gorm:"type:varchar(512);default:''" json:"result_summary"`
	CancelReason    string         `gorm:"type:varchar(256);default:''" json:"cancel_reason"`
	CreatedBy       uint64         `gorm:"type:bigint unsigned;default:0" json:"created_by"`
	CreatedAt       time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"type:datetime;index:idx_deleted_at" json:"deleted_at"`
}

type TaskStatusLog struct {
	ID         uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskID     uint64    `gorm:"type:bigint unsigned;not null;index:idx_task_id" json:"task_id"`
	FromStatus int8      `gorm:"type:tinyint;not null" json:"from_status"`
	ToStatus   int8      `gorm:"type:tinyint;not null" json:"to_status"`
	OperatorID uint64    `gorm:"type:bigint unsigned;default:0" json:"operator_id"`
	Remark     string    `gorm:"type:varchar(256);default:''" json:"remark"`
	CreatedAt  time.Time `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
}
