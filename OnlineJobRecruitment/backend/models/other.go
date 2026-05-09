package models

import "gorm.io/gorm"

type Exercise struct {
	gorm.Model
	Title      string `json:"title" gorm:"size:200;not null"`
	Content    string `json:"content" gorm:"type:text;not null"`
	Type       string `json:"type" gorm:"size:20"`
	Options    string `json:"options" gorm:"type:text"`
	Answer     string `json:"answer" gorm:"type:text"`
	Category   string `json:"category" gorm:"size:50"`
	Difficulty string `json:"difficulty" gorm:"size:20"`
	Status     int    `json:"status" gorm:"default:1"`
}

type News struct {
	gorm.Model
	Title      string `json:"title" gorm:"size:200;not null"`
	Content    string `json:"content" gorm:"type:text;not null"`
	Category   string `json:"category" gorm:"size:50"`
	Author     string `json:"author" gorm:"size:50"`
	Image      string `json:"image" gorm:"size:255"`
	Views      int    `json:"views" gorm:"default:0"`
	Status     int    `json:"status" gorm:"default:1"`
}

type Review struct {
	gorm.Model
	UserID        uint   `json:"user_id"`
	User          User   `json:"user" gorm:"foreignKey:UserID"`
	JobID         uint   `json:"job_id"`
	Job           Job    `json:"job" gorm:"foreignKey:JobID"`
	ApplicationID uint   `json:"application_id"`
	CompanyName     string `json:"company_name" gorm:"size:100"`
	Rating        int    `json:"rating"`
	Content       string `json:"content" gorm:"type:text"`
	InterviewExperience string `json:"interview_experience" gorm:"type:text"`
	Status        int    `json:"status" gorm:"default:1"`
}
