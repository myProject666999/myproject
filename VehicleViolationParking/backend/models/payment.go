package models

import (
	"time"
)

type Payment struct {
	ID            uint       `json:"id" gorm:"primaryKey"`
	PaymentNumber string     `json:"payment_number" gorm:"uniqueIndex;size:30;not null"`
	RecordID      *uint      `json:"record_id"`
	CardID        *uint      `json:"card_id"`
	PaymentType   int        `json:"payment_type" gorm:"comment:1-临时停车费 2-月卡续费"`
	Amount        float64    `json:"amount" gorm:"type:decimal(10,2)"`
	PayMethod     string     `json:"pay_method" gorm:"size:20"`
	PayStatus     int        `json:"pay_status" gorm:"default:0;comment:0-待支付 1-已支付 2-已退款"`
	PayTime       *time.Time `json:"pay_time"`
	OperatorID    *uint      `json:"operator_id"`
	Remark        string     `json:"remark" gorm:"size:255"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

func (Payment) TableName() string {
	return "payments"
}
