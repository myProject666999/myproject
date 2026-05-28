package model

import (
	"time"
)

const (
	BatteryStatusAvailable = 1
	BatteryStatusInUse     = 2
	BatteryStatusCharging  = 3
	BatteryStatusAbnormal  = 4
	BatteryStatusOffline   = 5
)

type Battery struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	BatteryNo     string    `gorm:"size:64;uniqueIndex" json:"battery_no"`
	Model         string    `gorm:"size:64" json:"model"`
	Capacity      int       `gorm:"type:int unsigned" json:"capacity"`
	Voltage       float64   `gorm:"type:decimal(5,2)" json:"voltage"`
	CurrentSOC    int       `gorm:"type:tinyint unsigned;index" json:"current_soc"`
	HealthStatus  int       `gorm:"type:tinyint unsigned;index" json:"health_status"`
	Temperature   *float64  `gorm:"type:decimal(5,2)" json:"temperature"`
	CycleCount    int       `gorm:"type:int unsigned" json:"cycle_count"`
	Status        int       `gorm:"type:tinyint;index" json:"status"`
	CabinetID     *uint64   `gorm:"index" json:"cabinet_id"`
	SlotID        *uint64   `gorm:"index" json:"slot_id"`
	UserID        *uint64   `gorm:"index" json:"user_id"`
	LastReportAt  *time.Time `json:"last_report_at"`
	ManufactureDate *time.Time `json:"manufacture_date"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (Battery) TableName() string {
	return "battery"
}

type BatteryStatusHistory struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	BatteryID    uint64    `gorm:"index:idx_battery_time" json:"battery_id"`
	CurrentSOC   int       `gorm:"type:tinyint unsigned" json:"current_soc"`
	HealthStatus int       `gorm:"type:tinyint unsigned" json:"health_status"`
	Temperature  *float64  `gorm:"type:decimal(5,2)" json:"temperature"`
	Status       int       `gorm:"type:tinyint" json:"status"`
	CabinetID    *uint64   `json:"cabinet_id"`
	ReportAt     time.Time `gorm:"index:idx_battery_time;index:idx_report_time" json:"report_at"`
	CreatedAt    time.Time `json:"created_at"`
}

func (BatteryStatusHistory) TableName() string {
	return "battery_status_history"
}

type BatteryListReq struct {
	Page       int    `form:"page,default=1"`
	PageSize   int    `form:"page_size,default=10"`
	BatteryNo  string `form:"battery_no"`
	Status     *int   `form:"status"`
	CabinetID  *uint64 `form:"cabinet_id"`
	MinSOC     *int   `form:"min_soc"`
	MaxSOC     *int   `form:"max_soc"`
	MinHealth  *int   `form:"min_health"`
}

type BatteryStatusReportReq struct {
	BatteryID    uint64   `json:"battery_id" binding:"required"`
	CurrentSOC   int      `json:"current_soc" binding:"required,min=0,max=100"`
	HealthStatus int      `json:"health_status" binding:"required,min=0,max=100"`
	Temperature  *float64 `json:"temperature"`
	Status       int      `json:"status" binding:"required"`
}

type BatteryOfflineReq struct {
	BatteryID uint64 `json:"battery_id" binding:"required"`
	Reason    string `json:"reason" binding:"required"`
}

type BatteryStatsVO struct {
	TotalCount      int64 `json:"total_count"`
	AvailableCount  int64 `json:"available_count"`
	InUseCount      int64 `json:"in_use_count"`
	ChargingCount   int64 `json:"charging_count"`
	AbnormalCount   int64 `json:"abnormal_count"`
	OfflineCount    int64 `json:"offline_count"`
	LowSocCount     int64 `json:"low_soc_count"`
	LowHealthCount  int64 `json:"low_health_count"`
}
