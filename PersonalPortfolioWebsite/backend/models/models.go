package models

import (
	"time"
)

type Category struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:100;not null;unique" json:"name"`
	Slug      string    `gorm:"size:100;not null;unique" json:"slug"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Project struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"size:255;not null" json:"title"`
	Slug        string    `gorm:"size:255;not null;unique" json:"slug"`
	Description string    `gorm:"type:text" json:"description"`
	Content     string    `gorm:"type:text" json:"content"`
	ImageURL    string    `gorm:"size:500" json:"image_url"`
	ProjectURL  string    `gorm:"size:500" json:"project_url"`
	GitHubURL   string    `gorm:"size:500" json:"github_url"`
	CategoryID  uint      `json:"category_id"`
	Category    Category  `gorm:"foreignKey:CategoryID" json:"category"`
	Tags        string    `gorm:"size:500" json:"tags"`
	Featured    bool      `gorm:"default:false" json:"featured"`
	Published   bool      `gorm:"default:true" json:"published"`
	Views       int       `gorm:"default:0" json:"views"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Skill struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Icon      string    `gorm:"size:255" json:"icon"`
	Level     int       `gorm:"default:0" json:"level"`
	Category  string    `gorm:"size:50" json:"category"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type About struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:100" json:"name"`
	Title     string    `gorm:"size:255" json:"title"`
	Bio       string    `gorm:"type:text" json:"bio"`
	AvatarURL string    `gorm:"size:500" json:"avatar_url"`
	Email     string    `gorm:"size:100" json:"email"`
	Phone     string    `gorm:"size:20" json:"phone"`
	Location  string    `gorm:"size:100" json:"location"`
	ResumeURL string    `gorm:"size:500" json:"resume_url"`
	SocialLinks string  `gorm:"type:text" json:"social_links"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Contact struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Email     string    `gorm:"size:100;not null" json:"email"`
	Subject   string    `gorm:"size:255" json:"subject"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	IPAddress string    `gorm:"size:45" json:"ip_address"`
	UserAgent string    `gorm:"size:500" json:"user_agent"`
	IsSpam    bool      `gorm:"default:false" json:"is_spam"`
	Read      bool      `gorm:"default:false" json:"read"`
	CreatedAt time.Time `json:"created_at"`
}

type Admin struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"size:50;not null;unique" json:"username"`
	Password  string    `gorm:"size:255;not null" json:"-"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
