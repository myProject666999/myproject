package models

import "time"

type Admin struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"unique;not null"`
	Password  string    `json:"-" gorm:"not null"`
	RealName  string    `json:"real_name" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Student struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	StudentNo string    `json:"student_no" gorm:"unique;not null"`
	Password  string    `json:"-" gorm:"not null"`
	RealName  string    `json:"real_name" gorm:"not null"`
	Gender    string    `json:"gender"`
	Birthday  string    `json:"birthday"`
	Phone     string    `json:"phone"`
	Email     string    `json:"email"`
	College   string    `json:"college"`
	Major     string    `json:"major"`
	Class     string    `json:"class"`
	Grade     string    `json:"grade"`
	Status    int       `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Service struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Category    string    `json:"category"`
	Description string    `json:"description"`
	Content     string    `json:"content"`
	Cover       string    `json:"cover"`
	Consultant  string    `json:"consultant"`
	Price       float64   `json:"price"`
	Duration    string    `json:"duration"`
	Status      int       `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Appointment struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	StudentID       uint      `json:"student_id"`
	ServiceID       uint      `json:"service_id"`
	AppointmentDate string    `json:"appointment_date"`
	AppointmentTime string    `json:"appointment_time"`
	ContactPhone    string    `json:"contact_phone"`
	Remark          string    `json:"remark"`
	Status          int       `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	Service         Service   `json:"service" gorm:"foreignKey:ServiceID"`
	Student         Student   `json:"student" gorm:"foreignKey:StudentID"`
}

type Knowledge struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	Title         string    `json:"title" gorm:"not null"`
	Category      string    `json:"category"`
	Summary       string    `json:"summary"`
	Content       string    `json:"content"`
	Attachment    string    `json:"attachment"`
	AttachmentName string   `json:"attachment_name"`
	Author        string    `json:"author"`
	Views         int       `json:"views"`
	Status        int       `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Message struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	StudentID uint      `json:"student_id"`
	Title     string    `json:"title" gorm:"not null"`
	Content   string    `json:"content"`
	Reply     string    `json:"reply"`
	Status    int       `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Student   Student   `json:"student" gorm:"foreignKey:StudentID"`
}

type News struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title" gorm:"not null"`
	Summary   string    `json:"summary"`
	Content   string    `json:"content"`
	Cover     string    `json:"cover"`
	Author    string    `json:"author"`
	Views     int       `json:"views"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Banner struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title"`
	Image     string    `json:"image" gorm:"not null"`
	Link      string    `json:"link"`
	Sort      int       `json:"sort"`
	Status    int       `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}
