package model

import (
	"time"
)

const (
	TaskTypeSupply  = 1
	TaskTypeReplace = 2
	TaskTypeRepair  = 3
)

const (
	PriorityHigh   = 1
	PriorityMedium = 2
	PriorityLow    = 3
)

const (
	TaskStatusPendingAssign = 1
	TaskStatusPendingExec   = 2
	TaskStatusExecuting     = 3
	TaskStatusCompleted     = 4
	TaskStatusCancelled     = 5
)

type DispatchTask struct {
	ID                 uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskNo             string     `gorm:"size:64;uniqueIndex" json:"task_no"`
	Type               int        `gorm:"type:tinyint" json:"type"`
	Priority           int        `gorm:"type:tinyint;index:idx_status_priority" json:"priority"`
	FromCabinetID      *uint64    `json:"from_cabinet_id"`
	ToCabinetID        uint64     `gorm:"index" json:"to_cabinet_id"`
	BatteryCount       int        `gorm:"type:tinyint unsigned" json:"battery_count"`
	BatteryIDs         *string    `gorm:"size:512" json:"battery_ids"`
	OperatorID         *uint64    `gorm:"index" json:"operator_id"`
	Status             int        `gorm:"type:tinyint;index:idx_status_priority" json:"status"`
	GapReason          *string    `gorm:"size:256" json:"gap_reason"`
	EstimateArriveTime *time.Time `json:"estimate_arrive_time"`
	ActualStartTime    *time.Time `json:"actual_start_time"`
	ActualFinishTime   *time.Time `json:"actual_finish_time"`
	Remark             *string    `gorm:"size:256" json:"remark"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}

func (DispatchTask) TableName() string {
	return "dispatch_task"
}

type DispatchTaskVO struct {
	DispatchTask
	FromCabinetName string `json:"from_cabinet_name"`
	FromCabinetNo   string `json:"from_cabinet_no"`
	ToCabinetName   string `json:"to_cabinet_name"`
	ToCabinetNo     string `json:"to_cabinet_no"`
	ToCabinetAddr   string `json:"to_cabinet_addr"`
	OperatorName    string `json:"operator_name"`
	OperatorPhone   string `json:"operator_phone"`
}

type DispatchTaskCreateReq struct {
	Type         int      `json:"type" binding:"required"`
	Priority     int      `json:"priority" binding:"required"`
	FromCabinetID *uint64  `json:"from_cabinet_id"`
	ToCabinetID   uint64   `json:"to_cabinet_id" binding:"required"`
	BatteryCount  int      `json:"battery_count" binding:"required,min=1"`
	BatteryIDs    []uint64 `json:"battery_ids"`
	GapReason     string   `json:"gap_reason"`
	Remark        string   `json:"remark"`
}

type DispatchTaskAssignReq struct {
	TaskID             uint64     `json:"task_id" binding:"required"`
	OperatorID         uint64     `json:"operator_id" binding:"required"`
	EstimateArriveTime *time.Time `json:"estimate_arrive_time"`
}

type DispatchTaskExecuteReq struct {
	TaskID   uint64   `json:"task_id" binding:"required"`
	BatteryIDs []uint64 `json:"battery_ids" binding:"required"`
}

type DispatchGapVO struct {
	CabinetID       uint64  `json:"cabinet_id"`
	CabinetName     string  `json:"cabinet_name"`
	CabinetNo       string  `json:"cabinet_no"`
	Address         string  `json:"address"`
	Longitude       float64 `json:"longitude"`
	Latitude        float64 `json:"latitude"`
	FullBatteryCount int    `json:"full_battery_count"`
	EmptySlotCount  int     `json:"empty_slot_count"`
	NeedCount       int     `json:"need_count"`
	GapLevel        int     `json:"gap_level"`
	Distance        float64 `json:"distance"`
}

type DispatchPlanReq struct {
	OperatorLongitude float64 `json:"operator_longitude" binding:"required"`
	OperatorLatitude  float64 `json:"operator_latitude" binding:"required"`
	MaxBatteries      int     `json:"max_batteries" binding:"required,min=1"`
}
