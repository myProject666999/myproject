package model

import "time"

type Article struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	ColumnID     uint64    `gorm:"not null" json:"column_id"`
	Title        string    `gorm:"size:255;not null" json:"title"`
	Summary      string    `gorm:"size:512" json:"summary"`
	Content      string    `gorm:"type:longtext;not null" json:"content"`
	TrialContent string    `gorm:"type:text" json:"trial_content"`
	IsFree       int8      `gorm:"not null;default:0" json:"is_free"`
	AuthorID     uint64    `gorm:"not null" json:"author_id"`
	ViewCount    int       `gorm:"not null;default:0" json:"view_count"`
	LikeCount    int       `gorm:"not null;default:0" json:"like_count"`
	CommentCount int       `gorm:"not null;default:0" json:"comment_count"`
	SortOrder    int       `gorm:"not null;default:0" json:"sort_order"`
	Status       int8      `gorm:"not null;default:1" json:"status"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	Column       *Column   `gorm:"foreignKey:ColumnID" json:"column,omitempty"`
	Author       *User     `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
}

func (Article) TableName() string {
	return "articles"
}
