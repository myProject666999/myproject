package models

import "gorm.io/gorm"

type JobType struct {
	gorm.Model
	Name        string `json:"name" gorm:"size:50;not null"`
	Description string `json:"description" gorm:"type:text"`
	Status      int    `json:"status" gorm:"default:1"`
}

type Job struct {
	gorm.Model
	Title       string  `json:"title" gorm:"size:100;not null"`
	JobTypeID   uint    `json:"job_type_id"`
	JobType     JobType `json:"job_type" gorm:"foreignKey:JobTypeID"`
	RecruiterID uint    `json:"recruiter_id"`
	Recruiter   User    `json:"recruiter" gorm:"foreignKey:RecruiterID"`
	Company     string  `json:"company" gorm:"size:100"`
	Salary      string  `json:"salary" gorm:"size:50"`
	Location    string  `json:"location" gorm:"size:100"`
	Experience  string  `json:"experience" gorm:"size:50"`
	Education   string  `json:"education" gorm:"size:50"`
	Description string  `json:"description" gorm:"type:text"`
	Requirements string `json:"requirements" gorm:"type:text"`
	Status      int     `json:"status" gorm:"default:1"`
	Views       int     `json:"views" gorm:"default:0"`
}
