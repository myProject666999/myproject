package models

import "time"

type Share struct {
	ID         uint       `gorm:"primaryKey" json:"id"`
	Token      string     `gorm:"uniqueIndex;size:64" json:"token"`
	Path       string     `gorm:"size:1024" json:"path"`
	IsDir      bool       `json:"is_dir"`
	ExpireAt   *time.Time `json:"expire_at"`
	AccessCount int       `json:"access_count"`
	MaxAccess  int        `json:"max_access"`
	CreatedAt  time.Time  `json:"created_at"`
}

func (Share) TableName() string {
	return "shares"
}
