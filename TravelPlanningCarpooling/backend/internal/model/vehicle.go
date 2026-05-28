package model

import "time"

type Vehicle struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	OwnerID       uint64    `gorm:"column:owner_id;index" json:"owner_id"`
	PlateNumber   string    `gorm:"type:varchar(20);uniqueIndex" json:"plate_number"`
	Brand         string    `gorm:"type:varchar(50);not null" json:"brand"`
	Model         string    `gorm:"type:varchar(50);not null" json:"model"`
	Color         string    `gorm:"type:varchar(20)" json:"color"`
	Seats         int       `gorm:"default:4" json:"seats"`
	VehiclePhoto  string    `gorm:"type:varchar(255)" json:"vehicle_photo"`
	IsVerified    int       `gorm:"default:0" json:"is_verified"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (Vehicle) TableName() string {
	return "vehicles"
}

type CreateVehicleRequest struct {
	PlateNumber  string `json:"plate_number" binding:"required"`
	Brand        string `json:"brand" binding:"required"`
	Model        string `json:"model" binding:"required"`
	Color        string `json:"color"`
	Seats        int    `json:"seats" binding:"required,min=1"`
	VehiclePhoto string `json:"vehicle_photo"`
}
