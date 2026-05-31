package models

import "time"

type GroupBuying struct {
	ID          uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	ProductID   uint      `json:"product_id" gorm:"index;not null"`
	InitiatorID uint      `json:"initiator_id" gorm:"index;not null"`
	Title       string    `json:"title" gorm:"size:200;not null"`
	GroupPrice  float64   `json:"group_price" gorm:"not null"`
	GroupSize   int       `json:"group_size" gorm:"not null"`
	CurrentSize int       `json:"current_size" gorm:"not null;default:1"`
	Status      int       `json:"status" gorm:"not null;default:0;comment:0进行中,1已成团,2已成团失败,3已取消"`
	ExpireTime  time.Time `json:"expire_time" gorm:"not null;index"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (GroupBuying) TableName() string {
	return "group_buying"
}
