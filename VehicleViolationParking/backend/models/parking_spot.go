package models

import (
	"time"

	"gorm.io/gorm"
)

type ParkingSpot struct {
	ID                  uint           `json:"id" gorm:"primaryKey"`
	SpotNumber          string         `json:"spot_number" gorm:"uniqueIndex;size:20;not null"`
	SpotType            int            `json:"spot_type" gorm:"default:1;comment:1-小型车位 2-中型车位 3-大型车位"`
	SpotArea            string         `json:"spot_area" gorm:"size:50"`
	Status              int            `json:"status" gorm:"default:0;comment:0-空闲 1-占用 2-预留 3-维修"`
	CurrentVehicleID    *uint          `json:"current_vehicle_id"`
	CurrentPlateNumber  string         `json:"current_plate_number" gorm:"size:20"`
	ReservedBy          *uint          `json:"reserved_by"`
	Remark              string         `json:"remark" gorm:"size:255"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `json:"-" gorm:"index"`
}

func (ParkingSpot) TableName() string {
	return "parking_spots"
}
