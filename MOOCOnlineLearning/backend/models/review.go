package models

import (
	"time"

	"gorm.io/gorm"
)

type CourseReview struct {
	ID        uint64         `gorm:"primaryKey;column:id" json:"id"`
	UserID    uint64         `gorm:"index:idx_user_id;not null;column:user_id" json:"user_id"`
	CourseID  uint64         `gorm:"index:idx_course_id;not null;column:course_id" json:"course_id"`
	Rating    uint8          `gorm:"default:5;not null;index:idx_rating;column:rating" json:"rating"`
	Content   string         `gorm:"size:1000;not null;column:content" json:"content"`
	ParentID  uint64         `gorm:"default:0;index:idx_parent_id;column:parent_id" json:"parent_id"`
	LikeCount uint           `gorm:"default:0;not null;column:like_count" json:"like_count"`
	Status    uint8          `gorm:"default:1;not null;column:status" json:"status"`
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
}

func (CourseReview) TableName() string { return "course_reviews" }

type ReviewLike struct {
	ID        uint64    `gorm:"primaryKey;column:id" json:"id"`
	UserID    uint64    `gorm:"not null;uniqueIndex:uk_user_review;column:user_id" json:"user_id"`
	ReviewID  uint64    `gorm:"not null;uniqueIndex:uk_user_review;column:review_id" json:"review_id"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
}

func (ReviewLike) TableName() string { return "review_likes" }
