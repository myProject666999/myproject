package model

import "time"

type User struct {
	ID           uint      `gorm:"primarykey;bigint unsigned;autoIncrement" json:"id"`
	Username     string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"username"`
	Email        string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"type:varchar(255);not null" json:"-"`
	Nickname     string    `gorm:"type:varchar(50);not null" json:"nickname"`
	AvatarURL    string    `gorm:"type:varchar(255)" json:"avatar_url"`
	Status       int8      `gorm:"type:tinyint;default:1" json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}

type UserStatus struct {
	ID             uint      `gorm:"primarykey;bigint unsigned;autoIncrement" json:"id"`
	UserID         uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	OnlineStatus   int8      `gorm:"type:tinyint;default:0" json:"online_status"`
	BusyMode       int8      `gorm:"type:tinyint;default:0" json:"busy_mode"`
	TextStatus     string    `gorm:"type:varchar(100)" json:"text_status"`
	CurrentRoomID  *uint     `json:"current_room_id"`
	CurrentSeatID  *uint     `json:"current_seat_id"`
	LastHeartbeat  *time.Time `json:"last_heartbeat"`
	LastActiveTime time.Time  `json:"last_active_time"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

func (UserStatus) TableName() string {
	return "user_status"
}
