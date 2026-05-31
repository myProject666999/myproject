package models

import "time"

type GroupParticipant struct {
	ID       uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	GroupID  uint      `json:"group_id" gorm:"index;not null"`
	UserID   uint      `json:"user_id" gorm:"index;not null"`
	OrderID  uint      `json:"order_id" gorm:"not null;default:0"`
	JoinType int       `json:"join_type" gorm:"not null;default:1;comment:1普通参与,2团长"`
	Status   int       `json:"status" gorm:"not null;default:0;comment:0待支付,1已支付,2已退款"`
	JoinedAt time.Time `json:"joined_at" gorm:"autoCreateTime"`
}

func (GroupParticipant) TableName() string {
	return "group_participants"
}
