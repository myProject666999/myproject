package model

import "time"

type Column struct {
	ID              uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Title           string    `gorm:"size:255;not null" json:"title"`
	Description     string    `gorm:"type:text" json:"description"`
	CoverImage      string    `gorm:"size:512" json:"cover_image"`
	AuthorID        uint64    `gorm:"not null" json:"author_id"`
	Price           float64   `gorm:"type:decimal(10,2);not null;default:0" json:"price"`
	IsFree          int8      `gorm:"not null;default:0" json:"is_free"`
	ArticleCount    int       `gorm:"not null;default:0" json:"article_count"`
	SubscriberCount int       `gorm:"not null;default:0" json:"subscriber_count"`
	ViewCount       int       `gorm:"not null;default:0" json:"view_count"`
	Status          int8      `gorm:"not null;default:1" json:"status"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	Author          *User     `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
}

func (Column) TableName() string {
	return "columns"
}
