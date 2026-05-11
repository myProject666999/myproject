package models

import "time"

type MedicalRecord struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	RecordNo      string    `gorm:"uniqueIndex;size:50;not null" json:"record_no" binding:"required"`
	PatientID     uint      `gorm:"not null" json:"patient_id" binding:"required"`
	DoctorID      *uint     `json:"doctor_id"`
	Diagnosis     string    `gorm:"type:text" json:"diagnosis"`
	Symptoms      string    `gorm:"type:text" json:"symptoms"`
	Examination   string    `gorm:"type:text" json:"examination"`
	TreatmentPlan string    `gorm:"type:text" json:"treatment_plan"`
	Prescription  string    `gorm:"type:text" json:"prescription"`
	Notes         string    `gorm:"type:text" json:"notes"`
	RecordDate    *string   `json:"record_date"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	Patient       *Patient  `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	Doctor        *Doctor   `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
}

func (MedicalRecord) TableName() string {
	return "medical_records"
}
