package models

import "time"

type Certificate struct {
	ID             uint64    `gorm:"primaryKey;column:id" json:"id"`
	CertificateNo  string    `gorm:"size:50;uniqueIndex:uk_certificate_no;not null;column:certificate_no" json:"certificate_no"`
	UserID         uint64    `gorm:"index:idx_user_id;not null;uniqueIndex:uk_user_course;column:user_id" json:"user_id"`
	CourseID       uint64    `gorm:"index:idx_course_id;not null;uniqueIndex:uk_user_course;column:course_id" json:"course_id"`
	Title          string    `gorm:"size:200;not null;column:title" json:"title"`
	CourseName     string    `gorm:"size:200;not null;column:course_name" json:"course_name"`
	TeacherName    string    `gorm:"size:50;not null;column:teacher_name" json:"teacher_name"`
	FinalScore     float64   `gorm:"type:decimal(5,2);default:0.00;not null;column:final_score" json:"final_score"`
	IssuedAt       time.Time `gorm:"column:issued_at" json:"issued_at"`
	CertificateURL string    `gorm:"size:500;column:certificate_url" json:"certificate_url"`
	CreatedAt      time.Time `gorm:"column:created_at" json:"created_at"`
}

func (Certificate) TableName() string { return "certificates" }
