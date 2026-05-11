package models

import "time"

type Medicine struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	MedicineNo   string    `gorm:"uniqueIndex;size:50;not null" json:"medicine_no" binding:"required"`
	Name         string    `gorm:"size:100;not null" json:"name" binding:"required"`
	GenericName  string    `gorm:"size:100" json:"generic_name"`
	Manufacturer string    `gorm:"size:100" json:"manufacturer"`
	Specification string   `gorm:"size:50" json:"specification"`
	DosageForm   string    `gorm:"size:50" json:"dosage_form"`
	Category     string    `gorm:"size:50" json:"category"`
	Unit         string    `gorm:"size:20" json:"unit"`
	Price        float64   `gorm:"type:decimal(10,2)" json:"price"`
	Stock        int       `gorm:"default:0" json:"stock"`
	Description  string    `gorm:"type:text" json:"description"`
	ImageURL     string    `gorm:"size:255" json:"image_url"`
	Status       int       `gorm:"default:1" json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (Medicine) TableName() string {
	return "medicines"
}
