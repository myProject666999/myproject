package model

import (
	"time"
)

const (
	PackageTypeTimes    = 1
	PackageTypeDuration = 2
)

const (
	PackageStatusOn  = 1
	PackageStatusOff = 2
)

const (
	UserPackageStatusValid    = 1
	UserPackageStatusUsedUp   = 2
	UserPackageStatusExpired  = 3
)

type Package struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name          string    `gorm:"size:64" json:"name"`
	Type          int       `gorm:"type:tinyint" json:"type"`
	TotalTimes    *int      `gorm:"type:int unsigned" json:"total_times"`
	DurationDays  *int      `gorm:"type:int unsigned" json:"duration_days"`
	Price         float64   `gorm:"type:decimal(10,2)" json:"price"`
	OriginalPrice float64   `gorm:"type:decimal(10,2)" json:"original_price"`
	SinglePrice   *float64  `gorm:"type:decimal(10,2)" json:"single_price"`
	Status        int       `gorm:"type:tinyint" json:"status"`
	Description   *string   `gorm:"size:512" json:"description"`
	Sort          int       `json:"sort"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (Package) TableName() string {
	return "package"
}

type UserPackage struct {
	ID              uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID          uint64    `gorm:"index:idx_user_status" json:"user_id"`
	PackageID       uint64    `json:"package_id"`
	PackageName     string    `gorm:"size:64" json:"package_name"`
	PackageType     int       `gorm:"type:tinyint" json:"package_type"`
	TotalTimes      *int      `gorm:"type:int unsigned" json:"total_times"`
	UsedTimes       int       `gorm:"type:int unsigned" json:"used_times"`
	RemainingTimes  *int      `gorm:"type:int unsigned" json:"remaining_times"`
	StartTime       time.Time `json:"start_time"`
	EndTime         time.Time `gorm:"index" json:"end_time"`
	OrderNo         string    `gorm:"size:64" json:"order_no"`
	PayAmount       float64   `gorm:"type:decimal(10,2)" json:"pay_amount"`
	Status          int       `gorm:"type:tinyint;index:idx_user_status" json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (UserPackage) TableName() string {
	return "user_package"
}

type PackagePurchaseReq struct {
	UserID    uint64 `json:"user_id" binding:"required"`
	PackageID uint64 `json:"package_id" binding:"required"`
	PayType   int    `json:"pay_type" binding:"required"`
}

type PackagePurchaseResp struct {
	OrderNo         string    `json:"order_no"`
	UserPackageID   uint64    `json:"user_package_id"`
	PackageName     string    `json:"package_name"`
	PayAmount       float64   `json:"pay_amount"`
	StartTime       time.Time `json:"start_time"`
	EndTime         time.Time `json:"end_time"`
	RemainingTimes  *int      `json:"remaining_times"`
}
