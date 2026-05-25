package models

import (
	"time"
)

type AccessRecord struct {
	ID              uint       `json:"id" gorm:"primaryKey"`
	PlateNumber     string     `json:"plate_number" gorm:"size:20;not null;index"`
	VehicleID       *uint      `json:"vehicle_id"`
	AccessType      int        `json:"access_type" gorm:"comment:1-入场 2-出场"`
	AccessTime      time.Time  `json:"access_time"`
	SpotID          *uint      `json:"spot_id"`
	EntryRecordID   *uint      `json:"entry_record_id"`
	EntryTime       *time.Time `json:"entry_time"`
	ExitTime        *time.Time `json:"exit_time"`
	ParkingDuration int        `json:"parking_duration"`
	ParkingFee      float64    `json:"parking_fee" gorm:"type:decimal(10,2)"`
	PayStatus       int        `json:"pay_status" gorm:"default:0;comment:0-未支付 1-已支付 2-免费"`
	PayTime         *time.Time `json:"pay_time"`
	PayMethod       string     `json:"pay_method" gorm:"size:20"`
	OperatorID      *uint      `json:"operator_id"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

func (AccessRecord) TableName() string {
	return "access_records"
}
