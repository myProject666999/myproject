package model

import "time"

type Comment struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	ArticleID uint64    `gorm:"not null" json:"article_id"`
	UserID    uint64    `gorm:"not null" json:"user_id"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	ParentID  *uint64   `json:"parent_id"`
	LikeCount int       `gorm:"not null;default:0" json:"like_count"`
	Status    int8      `gorm:"not null;default:1" json:"status"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Article   *Article  `gorm:"foreignKey:ArticleID" json:"article,omitempty"`
}

func (Comment) TableName() string {
	return "comments"
}
