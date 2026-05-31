package model

import "time"

type Like struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint64    `gorm:"not null;uniqueIndex:idx_user_article" json:"user_id"`
	ArticleID uint64    `gorm:"not null;uniqueIndex:idx_user_article" json:"article_id"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Article   *Article  `gorm:"foreignKey:ArticleID" json:"article,omitempty"`
}

func (Like) TableName() string {
	return "likes"
}
