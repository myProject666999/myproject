package model

import (
	"time"
)

const (
	CabinetStatusNormal   = 1
	CabinetStatusMaintain = 2
	CabinetStatusOffline  = 3
)

const (
	SlotStatusEmpty   = 1
	SlotStatusHasBatt = 2
	SlotStatusFault   = 3
)

const (
	LockStatusLocked   = 1
	LockStatusUnlocked = 2
)

type Cabinet struct {
	ID             uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CabinetNo      string    `gorm:"size:64;uniqueIndex" json:"cabinet_no"`
	Name           string    `gorm:"size:128" json:"name"`
	Address        string    `gorm:"size:256" json:"address"`
	Longitude      float64   `gorm:"type:decimal(10,7)" json:"longitude"`
	Latitude       float64   `gorm:"type:decimal(10,7)" json:"latitude"`
	TotalSlots     int       `gorm:"type:tinyint unsigned" json:"total_slots"`
	Status         int       `gorm:"type:tinyint" json:"status"`
	LastHeartbeatAt *time.Time `json:"last_heartbeat_at"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (Cabinet) TableName() string {
	return "cabinet"
}

type CabinetSlot struct {
	ID         uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	CabinetID  uint64    `gorm:"index:idx_cabinet_status" json:"cabinet_id"`
	SlotNo     int       `gorm:"type:tinyint unsigned" json:"slot_no"`
	BatteryID  *uint64   `gorm:"index" json:"battery_id"`
	Status     int       `gorm:"type:tinyint;index:idx_cabinet_status" json:"status"`
	LockStatus int       `gorm:"type:tinyint" json:"lock_status"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (CabinetSlot) TableName() string {
	return "cabinet_slot"
}

type CabinetVO struct {
	Cabinet
	EmptySlots   int `json:"empty_slots"`
	FullBatteries int `json:"full_batteries"`
	LowBatteries  int `json:"low_batteries"`
}

type CabinetListReq struct {
	Page     int    `form:"page,default=1"`
	PageSize int    `form:"page_size,default=10"`
	Keyword  string `form:"keyword"`
	Status   *int   `form:"status"`
}

type CabinetCreateReq struct {
	CabinetNo string  `json:"cabinet_no" binding:"required"`
	Name      string  `json:"name" binding:"required"`
	Address   string  `json:"address" binding:"required"`
	Longitude float64 `json:"longitude" binding:"required"`
	Latitude  float64 `json:"latitude" binding:"required"`
	TotalSlots int    `json:"total_slots" binding:"required,min=1"`
}

type CabinetUpdateReq struct {
	Name      string  `json:"name"`
	Address   string  `json:"address"`
	Longitude float64 `json:"longitude"`
	Latitude  float64 `json:"latitude"`
	Status    *int    `json:"status"`
}

type BatteryExchangeReq struct {
	UserID        uint64 `json:"user_id" binding:"required"`
	CabinetID     uint64 `json:"cabinet_id" binding:"required"`
	InBatteryID   uint64 `json:"in_battery_id" binding:"required"`
	IdempotentKey string `json:"idempotent_key" binding:"required"`
}

type BatteryExchangeResp struct {
	OrderNo       string `json:"order_no"`
	OutBatteryID  uint64 `json:"out_battery_id"`
	OutSlotID     uint64 `json:"out_slot_id"`
	InSlotID      uint64 `json:"in_slot_id"`
	Amount        float64 `json:"amount"`
	PayAmount     float64 `json:"pay_amount"`
	PayType       int    `json:"pay_type"`
	Status        int    `json:"status"`
}
