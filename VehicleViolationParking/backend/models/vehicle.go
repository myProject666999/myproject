package models

import (
	"time"

	"gorm.io/gorm"
)

type Vehicle struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	PlateNumber    string         `json:"plate_number" gorm:"uniqueIndex;size:20;not null"`
	VehicleType    int            `json:"vehicle_type" gorm:"default:1;comment:1-小型车 2-中型车 3-大型车"`
	OwnerName      string         `json:"owner_name" gorm:"size:50"`
	OwnerPhone     string         `json:"owner_phone" gorm:"size:20"`
	CardType       int            `json:"card_type" gorm:"default:1;comment:1-临时车 2-月卡车"`
	CardExpireTime *time.Time     `json:"card_expire_time"`
	Status         int            `json:"status" gorm:"default:1;comment:1-正常 2-禁用"`
	Remark         string         `json:"remark" gorm:"size:255"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
}

func (Vehicle) TableName() string {
	return "vehicles"
}
