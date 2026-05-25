package models

import (
	"time"
)

type BillingRule struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	RuleName     string    `json:"rule_name" gorm:"size:50;not null"`
	VehicleType  int       `json:"vehicle_type" gorm:"default:1"`
	BaseFee      float64   `json:"base_fee" gorm:"type:decimal(10,2);default:0"`
	BaseDuration int       `json:"base_duration" gorm:"default:30;comment:分钟"`
	UnitFee      float64   `json:"unit_fee" gorm:"type:decimal(10,2);default:0"`
	UnitDuration int       `json:"unit_duration" gorm:"default:30;comment:分钟"`
	MaxFee       float64   `json:"max_fee" gorm:"type:decimal(10,2);default:0;comment:0表示不封顶"`
	FreeDuration int       `json:"free_duration" gorm:"default:15;comment:免费时长(分钟)"`
	MonthlyFee   *float64  `json:"monthly_fee" gorm:"type:decimal(10,2)"`
	Priority     int       `json:"priority" gorm:"default:0"`
	Status       int       `json:"status" gorm:"default:1"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (BillingRule) TableName() string {
	return "billing_rules"
}
