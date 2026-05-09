package models

import "time"

type Student struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null"`
	StudentID   string    `json:"student_id" gorm:"uniqueIndex;not null"`
	Class       string    `json:"class"`
	Grade       string    `json:"grade"`
	Phone       string    `json:"phone"`
	Address     string    `json:"address"`
	HealthStatus string   `json:"health_status"`
	Temperature float64   `json:"temperature"`
	CreateTime  time.Time `json:"create_time" gorm:"autoCreateTime"`
}

type Teacher struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null"`
	TeacherID   string    `json:"teacher_id" gorm:"uniqueIndex;not null"`
	Department  string    `json:"department"`
	Position    string    `json:"position"`
	Phone       string    `json:"phone"`
	Address     string    `json:"address"`
	HealthStatus string   `json:"health_status"`
	Temperature float64   `json:"temperature"`
	CreateTime  time.Time `json:"create_time" gorm:"autoCreateTime"`
}

type Visitor struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null"`
	IDCard      string    `json:"id_card" gorm:"uniqueIndex;not null"`
	Phone       string    `json:"phone"`
	Address     string    `json:"address"`
	VisitReason string    `json:"visit_reason"`
	VisitPerson string    `json:"visit_person"`
	HealthStatus string   `json:"health_status"`
	Temperature float64   `json:"temperature"`
	CreateTime  time.Time `json:"create_time" gorm:"autoCreateTime"`
}

type Blacklist struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null"`
	IDCard      string    `json:"id_card" gorm:"uniqueIndex;not null"`
	Phone       string    `json:"phone"`
	Reason      string    `json:"reason"`
	CreateTime  time.Time `json:"create_time" gorm:"autoCreateTime"`
}
