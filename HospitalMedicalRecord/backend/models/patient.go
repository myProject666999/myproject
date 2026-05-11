package models

import "time"

type Patient struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	PatientNo       string    `gorm:"uniqueIndex;size:50;not null" json:"patient_no" binding:"required"`
	Name            string    `gorm:"size:50;not null" json:"name" binding:"required"`
	Gender          string    `gorm:"size:10;not null" json:"gender" binding:"required,oneof=male female"`
	BirthDate       *string   `json:"birth_date"`
	IDCard          string    `gorm:"size:18" json:"id_card"`
	Phone           string    `gorm:"size:20" json:"phone"`
	Address         string    `gorm:"size:255" json:"address"`
	EmergencyContact string  `gorm:"size:50" json:"emergency_contact"`
	EmergencyPhone  string   `gorm:"size:20" json:"emergency_phone"`
	Allergies       string    `gorm:"type:text" json:"allergies"`
	MedicalHistory  string    `gorm:"type:text" json:"medical_history"`
	Status          int       `gorm:"default:1" json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (Patient) TableName() string {
	return "patients"
}
