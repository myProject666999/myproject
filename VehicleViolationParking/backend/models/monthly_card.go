package models

import (
	"time"

	"gorm.io/gorm"
)

type MonthlyCard struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	CardNumber   string         `json:"card_number" gorm:"uniqueIndex;size:30;not null"`
	VehicleID    uint           `json:"vehicle_id" gorm:"index;not null"`
	PlateNumber  string         `json:"plate_number" gorm:"size:20;index"`
	OwnerName    string         `json:"owner_name" gorm:"size:50"`
	OwnerPhone   string         `json:"owner_phone" gorm:"size:20"`
	StartDate    time.Time      `json:"start_date"`
	EndDate      time.Time      `json:"end_date"`
	Months       int            `json:"months"`
	TotalFee     float64        `json:"total_fee" gorm:"type:decimal(10,2)"`
	Status       int            `json:"status" gorm:"default:1;comment:1-有效 2-已过期 3-已退卡"`
	OperatorID   *uint          `json:"operator_id"`
	Remark       string         `json:"remark" gorm:"size:255"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

func (MonthlyCard) TableName() string {
	return "monthly_cards"
}
