package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Username     string         `json:"username" gorm:"unique;not null"`
	Password     string         `json:"-" gorm:"not null"`
	Email        string         `json:"email" gorm:"unique"`
	Phone        string         `json:"phone"`
	RealName     string         `json:"real_name"`
	Avatar       string         `json:"avatar"`
	Role         string         `json:"role" gorm:"default:user"`
	Status       int            `json:"status" gorm:"default:1"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
	Favorites    []Favorite     `json:"favorites,omitempty" gorm:"foreignKey:UserID"`
	Applications []Application  `json:"applications,omitempty" gorm:"foreignKey:UserID"`
	Recruitments []Recruitment  `json:"recruitments,omitempty" gorm:"foreignKey:UserID"`
}

type EmergencyNotice struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"not null"`
	Content     string         `json:"content" gorm:"type:text"`
	Summary     string         `json:"summary"`
	Level       string         `json:"level"`
	Status      int            `json:"status" gorm:"default:1"`
	Views       int            `json:"views" gorm:"default:0"`
	AuthorID    uint           `json:"author_id"`
	AuthorName  string         `json:"author_name"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Material struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null"`
	Description string         `json:"description" gorm:"type:text"`
	Category    string         `json:"category"`
	Quantity    int            `json:"quantity" gorm:"default:0"`
	Unit        string         `json:"unit"`
	Status      int            `json:"status" gorm:"default:1"`
	Location    string         `json:"location"`
	Image       string         `json:"image"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type PsychologicalKnowledge struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"not null"`
	Content     string         `json:"content" gorm:"type:text"`
	Summary     string         `json:"summary"`
	Category    string         `json:"category"`
	Status      int            `json:"status" gorm:"default:1"`
	Views       int            `json:"views" gorm:"default:0"`
	AuthorID    uint           `json:"author_id"`
	AuthorName  string         `json:"author_name"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Recruitment struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"not null"`
	Content     string         `json:"content" gorm:"type:text"`
	Position    string         `json:"position"`
	Number      int            `json:"number"`
	Location    string         `json:"location"`
	Deadline    time.Time      `json:"deadline"`
	Status      int            `json:"status" gorm:"default:1"`
	Likes       int            `json:"likes" gorm:"default:0"`
	Dislikes    int            `json:"dislikes" gorm:"default:0"`
	UserID      uint           `json:"user_id"`
	UserName    string         `json:"user_name"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Volunteer struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null"`
	Phone       string         `json:"phone"`
	Email       string         `json:"email"`
	Skills      string         `json:"skills"`
	Experience  string         `json:"experience" gorm:"type:text"`
	Status      int            `json:"status" gorm:"default:1"`
	Photo       string         `json:"photo"`
	UserID      uint           `json:"user_id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type HelpRequest struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"not null"`
	Content     string         `json:"content" gorm:"type:text"`
	Location    string         `json:"location"`
	Phone       string         `json:"phone"`
	Status      int            `json:"status" gorm:"default:0"`
	UserID      uint           `json:"user_id"`
	UserName    string         `json:"user_name"`
	ApprovedBy  uint           `json:"approved_by"`
	ApprovedAt  time.Time      `json:"approved_at"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Application struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	MaterialID   uint           `json:"material_id"`
	MaterialName string         `json:"material_name"`
	UserID       uint           `json:"user_id"`
	UserName     string         `json:"user_name"`
	Quantity     int            `json:"quantity"`
	Reason       string         `json:"reason" gorm:"type:text"`
	Status       int            `json:"status" gorm:"default:0"`
	ApprovedBy   uint           `json:"approved_by"`
	ApprovedAt   time.Time      `json:"approved_at"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type RecruitmentApplication struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	RecruitmentID uint           `json:"recruitment_id"`
	RecruitmentTitle string       `json:"recruitment_title"`
	UserID        uint           `json:"user_id"`
	UserName      string         `json:"user_name"`
	Phone         string         `json:"phone"`
	Experience    string         `json:"experience" gorm:"type:text"`
	Status        int            `json:"status" gorm:"default:0"`
	ApprovedBy    uint           `json:"approved_by"`
	ApprovedAt    time.Time      `json:"approved_at"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}

type MedicalAid struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"not null"`
	Content     string         `json:"content" gorm:"type:text"`
	Location    string         `json:"location"`
	Phone       string         `json:"phone"`
	Status      int            `json:"status" gorm:"default:0"`
	UserID      uint           `json:"user_id"`
	UserName    string         `json:"user_name"`
	ApprovedBy  uint           `json:"approved_by"`
	ApprovedAt  time.Time      `json:"approved_at"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Favorite struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     uint           `json:"user_id"`
	Type       string         `json:"type"`
	TargetID   uint           `json:"target_id"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

type Rumor struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"not null"`
	Content     string         `json:"content" gorm:"type:text"`
	Status      int            `json:"status" gorm:"default:1"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}
