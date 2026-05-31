package models

import "time"

type Refund struct {
	ID          uint       `json:"id" gorm:"primaryKey;autoIncrement"`
	OrderID     uint       `json:"order_id" gorm:"index;not null"`
	UserID      uint       `json:"user_id" gorm:"index;not null"`
	GroupID     uint       `json:"group_id" gorm:"not null"`
	Amount      float64    `json:"amount" gorm:"not null"`
	Reason      string     `json:"reason" gorm:"size:255;not null;default:''"`
	Status      int        `json:"status" gorm:"not null;default:0;comment:0处理中,1成功,2失败"`
	ProcessedAt *time.Time `json:"processed_at" gorm:"null"`
	CreatedAt   time.Time  `json:"created_at"`
}

func (Refund) TableName() string {
	return "refunds"
}
