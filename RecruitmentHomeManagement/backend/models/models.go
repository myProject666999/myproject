package models

import (
	"time"
)

type Role string

const (
	RoleAdmin    Role = "admin"
	RoleUser     Role = "user"
	RoleCompany  Role = "company"
)

type User struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Username    string    `gorm:"unique;not null" json:"username"`
	Password    string    `gorm:"not null" json:"-"`
	Email       string    `gorm:"unique" json:"email"`
	Phone       string    `json:"phone"`
	Role        Role      `gorm:"not null" json:"role"`
	Name        string    `json:"name"`
	Avatar      string    `json:"avatar"`
	Profile     string    `json:"profile"`
	Skills      string    `json:"skills"`
	Experience  int       `json:"experience"`
	Education   string    `json:"education"`
	SalaryMin   int       `json:"salary_min"`
	SalaryMax   int       `json:"salary_max"`
	City        string    `json:"city"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Company struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null" json:"user_id"`
	Name        string    `gorm:"not null" json:"name"`
	Logo        string    `json:"logo"`
	Industry    string    `json:"industry"`
	Scale       string    `json:"scale"`
	City        string    `json:"city"`
	Address     string    `json:"address"`
	Website     string    `json:"website"`
	Description string    `json:"description"`
	IsFamous    bool      `gorm:"default:false" json:"is_famous"`
	Verified    bool      `gorm:"default:false" json:"verified"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Job struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	CompanyID    uint      `gorm:"not null" json:"company_id"`
	Title        string    `gorm:"not null" json:"title"`
	SalaryMin    int       `json:"salary_min"`
	SalaryMax    int       `json:"salary_max"`
	City         string    `json:"city"`
	Experience   string    `json:"experience"`
	Education    string    `json:"education"`
	Description  string    `json:"description"`
	Requirements string    `json:"requirements"`
	Benefits     string    `json:"benefits"`
	Views        int       `gorm:"default:0" json:"views"`
	Status       int       `gorm:"default:1" json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Company      Company   `gorm:"foreignKey:CompanyID" json:"company,omitempty"`
}

type JobSeeker struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	UserID       uint      `gorm:"not null" json:"user_id"`
	Title        string    `gorm:"not null" json:"title"`
	ExpectedPosition string  `json:"expected_position"`
	SalaryMin    int       `json:"salary_min"`
	SalaryMax    int       `json:"salary_max"`
	City         string    `json:"city"`
	Experience   string    `json:"experience"`
	Education    string    `json:"education"`
	Skills       string    `json:"skills"`
	Description  string    `json:"description"`
	Resume       string    `json:"resume"`
	Status       int       `gorm:"default:1" json:"status"`
	Views        int       `gorm:"default:0" json:"views"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	User         User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

type Application struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	JobID      uint      `gorm:"not null" json:"job_id"`
	SeekerID   uint      `gorm:"not null" json:"seeker_id"`
	CompanyID  uint      `gorm:"not null" json:"company_id"`
	Status     int       `gorm:"default:0" json:"status"`
	Message    string    `json:"message"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	Job        Job       `gorm:"foreignKey:JobID" json:"job,omitempty"`
	Seeker     JobSeeker `gorm:"foreignKey:SeekerID" json:"seeker,omitempty"`
}

type Blog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"not null" json:"user_id"`
	Title      string    `gorm:"not null" json:"title"`
	Content    string    `gorm:"not null" json:"content"`
	Tags       string    `json:"tags"`
	Views      int       `gorm:"default:0" json:"views"`
	Likes      int       `gorm:"default:0" json:"likes"`
	Status     int       `gorm:"default:1" json:"status"`
	ReviewerID uint      `json:"reviewer_id"`
	ReviewMsg  string    `json:"review_msg"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	User       User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

type BrowsingHistory struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	JobID     uint      `json:"job_id"`
	Type      string    `gorm:"not null" json:"type"`
	CreatedAt time.Time `json:"created_at"`
}
