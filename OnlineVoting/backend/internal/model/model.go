package model

import "time"

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Username  string    `json:"username" gorm:"size:64;uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"size:255;not null"`
	Role      int       `json:"role" gorm:"default:1"`
	CreatedAt time.Time `json:"created_at"`
}

type Activity struct {
	ID          uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Title       string    `json:"title" gorm:"size:128;not null"`
	Description string    `json:"description"`
	Type        int       `json:"type"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	Status      int       `json:"status" gorm:"default:1"`
	CreatedBy   uint      `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Options     []Option  `json:"options,omitempty" gorm:"foreignKey:ActivityID"`
}

type Option struct {
	ID         uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	ActivityID uint      `json:"activity_id" gorm:"index;not null"`
	Name       string    `json:"name" gorm:"size:128;not null"`
	Image      string    `json:"image"`
	VoteCount  int       `json:"vote_count" gorm:"default:0"`
	SortOrder  int       `json:"sort_order" gorm:"default:0"`
	CreatedAt  time.Time `json:"created_at"`
}

type VoteRecord struct {
	ID         uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	ActivityID uint      `json:"activity_id" gorm:"index;not null"`
	OptionID   uint      `json:"option_id" gorm:"index;not null"`
	UserID     *uint     `json:"user_id" gorm:"index"`
	UserIP     string    `json:"user_ip" gorm:"size:64"`
	UserAgent  string    `json:"user_agent" gorm:"size:255"`
	CreatedAt  time.Time `json:"created_at"`
}

type LotteryRecord struct {
	ID         uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	ActivityID uint      `json:"activity_id" gorm:"index;not null"`
	OptionID   uint      `json:"option_id" gorm:"index;not null"`
	UserID     *uint     `json:"user_id" gorm:"index"`
	UserIP     string    `json:"user_ip" gorm:"size:64"`
	CreatedAt  time.Time `json:"created_at"`
}
