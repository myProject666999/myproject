package model

import "time"

type Message struct {
	ID         uint      `gorm:"primarykey;bigint unsigned;autoIncrement" json:"id"`
	RoomID     *uint     `json:"room_id"`
	SenderID   uint      `gorm:"not null" json:"sender_id"`
	ReceiverID *uint     `json:"receiver_id"`
	Type       int8      `gorm:"type:tinyint;default:1" json:"type"`
	Content    string    `gorm:"type:text;not null" json:"content"`
	IsRead     int8      `gorm:"type:tinyint;default:0" json:"is_read"`
	CreatedAt  time.Time `json:"created_at"`
}

func (Message) TableName() string {
	return "messages"
}

type CallRecord struct {
	ID        uint       `gorm:"primarykey;bigint unsigned;autoIncrement" json:"id"`
	CallerID  uint       `gorm:"not null" json:"caller_id"`
	CalleeID  uint       `gorm:"not null" json:"callee_id"`
	RoomID    *uint      `json:"room_id"`
	Type      int8       `gorm:"type:tinyint;default:1" json:"type"`
	Status    int8       `gorm:"type:tinyint;default:1" json:"status"`
	StartTime time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"start_time"`
	EndTime   *time.Time `json:"end_time"`
	Duration  int        `gorm:"default:0" json:"duration"`
}

func (CallRecord) TableName() string {
	return "call_records"
}

type Activity struct {
	ID           uint      `gorm:"primarykey;bigint unsigned;autoIncrement" json:"id"`
	UserID       uint      `gorm:"not null" json:"user_id"`
	Type         int8      `gorm:"type:tinyint;not null" json:"type"`
	Content      string    `gorm:"type:varchar(255)" json:"content"`
	RoomID       *uint     `json:"room_id"`
	TargetUserID *uint     `json:"target_user_id"`
	CreatedAt    time.Time `json:"created_at"`
}

func (Activity) TableName() string {
	return "activities"
}
