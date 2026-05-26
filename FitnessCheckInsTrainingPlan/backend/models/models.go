package models

import (
	"time"
)

type Exercise struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Category    string    `json:"category"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type TrainingPlan struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Weekdays  string         `json:"weekdays"`
	Exercises []PlanExercise `gorm:"foreignKey:PlanID" json:"exercises"`
	CreatedAt time.Time      `json:"created_at"`
}

type PlanExercise struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	PlanID   uint   `json:"plan_id"`
	Exercise string `json:"exercise"`
	Sets     int    `json:"sets"`
	Reps     int    `json:"reps"`
	Weight   float64 `json:"weight"`
}

type CheckIn struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Date        string         `gorm:"uniqueIndex;not null" json:"date"`
	Completed   bool           `json:"completed"`
	Note        string         `json:"note"`
	Exercises   []CheckInExercise `gorm:"foreignKey:CheckInID" json:"exercises"`
	CreatedAt   time.Time      `json:"created_at"`
}

type CheckInExercise struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	CheckInID uint    `json:"check_in_id"`
	Exercise  string  `json:"exercise"`
	Sets      int     `json:"sets"`
	Reps      int     `json:"reps"`
	Weight    float64 `json:"weight"`
	Completed bool    `json:"completed"`
}

type BodyRecord struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Date      string    `gorm:"uniqueIndex;not null" json:"date"`
	Weight    float64   `json:"weight"`
	Chest     float64   `json:"chest"`
	Waist     float64   `json:"waist"`
	Hip       float64   `json:"hip"`
	Arm       float64   `json:"arm"`
	Thigh     float64   `json:"thigh"`
	CreatedAt time.Time `json:"created_at"`
}

type Achievement struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `json:"name"`
	Badge       string    `json:"badge"`
	Description string    `json:"description"`
	Unlocked    bool      `json:"unlocked"`
	UnlockedAt  *string   `json:"unlocked_at"`
}

type UserStats struct {
	TotalCheckIns     int    `json:"total_check_ins"`
	CurrentStreak     int    `json:"current_streak"`
	LongestStreak     int    `json:"longest_streak"`
	TotalWeightLifted float64 `json:"total_weight_lifted"`
}
