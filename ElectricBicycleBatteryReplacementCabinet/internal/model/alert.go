package model

import (
	"time"
)

const (
	AlertTypeBatteryAbnormal = 1
	AlertTypeCabinetAbnormal = 2
	AlertTypeLowBattery      = 3
	AlertTypeTemperature     = 4
	AlertTypeOther           = 5
)

const (
	AlertLevelUrgent   = 1
	AlertLevelImportant = 2
	AlertLevelNormal   = 3
)

const (
	AlertStatusPending   = 1
	AlertStatusProcessing = 2
	AlertStatusResolved  = 3
	AlertStatusIgnored   = 4
)

type Alert struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	AlertNo      string    `gorm:"size:64;uniqueIndex" json:"alert_no"`
	Type         int       `gorm:"type:tinyint;index:idx_type_level" json:"type"`
	Level        int       `gorm:"type:tinyint;index:idx_type_level" json:"level"`
	CabinetID    *uint64   `gorm:"index" json:"cabinet_id"`
	BatteryID    *uint64   `gorm:"index" json:"battery_id"`
	SlotID       *uint64   `gorm:"index" json:"slot_id"`
	Title        string    `gorm:"size:128" json:"title"`
	Content      *string   `gorm:"type:text" json:"content"`
	Status       int       `gorm:"type:tinyint;index" json:"status"`
	HandlerID    *uint64   `json:"handler_id"`
	HandleTime   *time.Time `json:"handle_time"`
	HandleResult *string   `gorm:"size:512" json:"handle_result"`
	CreatedAt    time.Time `gorm:"index" json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (Alert) TableName() string {
	return "alert"
}

type AlertVO struct {
	Alert
	CabinetName string `json:"cabinet_name"`
	CabinetNo   string `json:"cabinet_no"`
	BatteryNo   string `json:"battery_no"`
	HandlerName string `json:"handler_name"`
}

type AlertListReq struct {
	Page      int       `form:"page,default=1"`
	PageSize  int       `form:"page_size,default=10"`
	Type      *int      `form:"type"`
	Level     *int      `form:"level"`
	Status    *int      `form:"status"`
	CabinetID *uint64   `form:"cabinet_id"`
	BatteryID *uint64   `form:"battery_id"`
	StartTime *time.Time `form:"start_time"`
	EndTime   *time.Time `form:"end_time"`
}

type AlertHandleReq struct {
	AlertID      uint64 `json:"alert_id" binding:"required"`
	Status       int    `json:"status" binding:"required"`
	HandlerID    uint64 `json:"handler_id" binding:"required"`
	HandleResult string `json:"handle_result" binding:"required"`
}

type AlertCreateReq struct {
	Type      int     `json:"type" binding:"required"`
	Level     int     `json:"level" binding:"required"`
	CabinetID *uint64 `json:"cabinet_id"`
	BatteryID *uint64 `json:"battery_id"`
	SlotID    *uint64 `json:"slot_id"`
	Title     string  `json:"title" binding:"required"`
	Content   string  `json:"content"`
}

type AlertStatsVO struct {
	TotalCount     int64 `json:"total_count"`
	PendingCount   int64 `json:"pending_count"`
	ProcessingCount int64 `json:"processing_count"`
	ResolvedCount  int64 `json:"resolved_count"`
	UrgentCount    int64 `json:"urgent_count"`
	ImportantCount int64 `json:"important_count"`
	TodayCount     int64 `json:"today_count"`
}
