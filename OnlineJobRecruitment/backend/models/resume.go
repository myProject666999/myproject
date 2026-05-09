package models

import "gorm.io/gorm"

type Resume struct {
	gorm.Model
	UserID       uint   `json:"user_id"`
	User         User   `json:"user" gorm:"foreignKey:UserID"`
	Name         string `json:"name" gorm:"size:50"`
	Gender       string `json:"gender" gorm:"size:10"`
	Age          int    `json:"age"`
	Phone        string `json:"phone" gorm:"size:20"`
	Email        string `json:"email" gorm:"size:100"`
	Education    string `json:"education" gorm:"size:50"`
	School       string `json:"school" gorm:"size:100"`
	Major        string `json:"major" gorm:"size:50"`
	Experience   string `json:"experience" gorm:"size:50"`
	Skills       string `json:"skills" gorm:"type:text"`
	Introduction string `json:"introduction" gorm:"type:text"`
	WorkExperience string `json:"work_experience" gorm:"type:text"`
	EducationExperience string `json:"education_experience" gorm:"type:text"`
	ProjectExperience string `json:"project_experience" gorm:"type:text"`
	ExpectedSalary string `json:"expected_salary" gorm:"size:50"`
	ExpectedPosition string `json:"expected_position" gorm:"size:50"`
	IsPublic     int    `json:"is_public" gorm:"default:0"`
}

type Application struct {
	gorm.Model
	JobID       uint   `json:"job_id"`
	Job         Job    `json:"job" gorm:"foreignKey:JobID"`
	UserID      uint   `json:"user_id"`
	User        User   `json:"user" gorm:"foreignKey:UserID"`
	ResumeID    uint   `json:"resume_id"`
	Resume      Resume `json:"resume" gorm:"foreignKey:ResumeID"`
	Status      string `json:"status" gorm:"size:20;default:'pending'"`
	InterviewTime string `json:"interview_time" gorm:"size:50"`
	InterviewLocation string `json:"interview_location" gorm:"size:100"`
	Note        string `json:"note" gorm:"type:text"`
}

type Favorite struct {
	gorm.Model
	RecruiterID uint   `json:"recruiter_id"`
	ResumeID    uint   `json:"resume_id"`
	Resume      Resume `json:"resume" gorm:"foreignKey:ResumeID"`
	Note        string `json:"note" gorm:"type:text"`
}

type Interview struct {
	gorm.Model
	ApplicationID uint        `json:"application_id"`
	Application Application `json:"application" gorm:"foreignKey:ApplicationID"`
	Result      string      `json:"result" gorm:"size:20"`
	Feedback    string      `json:"feedback" gorm:"type:text"`
	Interviewer string      `json:"interviewer" gorm:"size:50"`
}
