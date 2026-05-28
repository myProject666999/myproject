package model

import "time"

type LocationShare struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	RideID    uint64    `gorm:"column:ride_id;index" json:"ride_id"`
	UserID    uint64    `gorm:"column:user_id;index" json:"user_id"`
	Lng       float64   `gorm:"type:decimal(10,7);not null" json:"lng"`
	Lat       float64   `gorm:"type:decimal(10,7);not null" json:"lat"`
	Speed     float64   `gorm:"type:decimal(10,2)" json:"speed"`
	Heading   float64   `gorm:"type:decimal(5,2)" json:"heading"`
	CreatedAt time.Time `json:"created_at"`
}

func (LocationShare) TableName() string {
	return "location_shares"
}

type ReportLocationRequest struct {
	RideID  uint64  `json:"ride_id" binding:"required"`
	Lng     float64 `json:"lng" binding:"required"`
	Lat     float64 `json:"lat" binding:"required"`
	Speed   float64 `json:"speed"`
	Heading float64 `json:"heading"`
}
