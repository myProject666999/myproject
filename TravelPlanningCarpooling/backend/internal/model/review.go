package model

import "time"

type Review struct {
	ID         uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID    uint64    `gorm:"column:order_id;uniqueIndex:uk_order_reviewer" json:"order_id"`
	RideID     uint64    `gorm:"column:ride_id" json:"ride_id"`
	ReviewerID uint64    `gorm:"column:reviewer_id;uniqueIndex:uk_order_reviewer" json:"reviewer_id"`
	RevieweeID uint64    `gorm:"column:reviewee_id;index" json:"reviewee_id"`
	Rating     int       `gorm:"not null" json:"rating"`
	Content    string    `gorm:"type:varchar(500)" json:"content"`
	Tags       string    `gorm:"type:varchar(200)" json:"tags"`
	CreatedAt  time.Time `json:"created_at"`
	Reviewer   *User     `gorm:"foreignKey:ReviewerID" json:"reviewer,omitempty"`
	Reviewee   *User     `gorm:"foreignKey:RevieweeID" json:"reviewee,omitempty"`
}

func (Review) TableName() string {
	return "reviews"
}

type CreateReviewRequest struct {
	OrderID    uint64 `json:"order_id" binding:"required"`
	RideID     uint64 `json:"ride_id" binding:"required"`
	RevieweeID uint64 `json:"reviewee_id" binding:"required"`
	Rating     int    `json:"rating" binding:"required,min=1,max=5"`
	Content    string `json:"content"`
	Tags       string `json:"tags"`
}
