package models

import "time"

type Customer struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"`
	Phone     string    `json:"phone" gorm:"size:20"`
	Address   string    `json:"address" gorm:"size:255"`
	BabyAge   int       `json:"baby_age"`
	BabyCount int       `json:"baby_count"`
	Notes     string    `json:"notes" gorm:"type:text"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Demand struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CustomerID  uint      `json:"customer_id"`
	ServiceType string    `json:"service_type" gorm:"size:50"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	Budget      float64   `json:"budget"`
	Requirements string   `json:"requirements" gorm:"type:text"`
	SpecialNeeds string   `json:"special_needs" gorm:"type:text"`
	SkillIDs    string    `json:"skill_ids" gorm:"size:255"`
	Status      string    `json:"status" gorm:"size:20"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
