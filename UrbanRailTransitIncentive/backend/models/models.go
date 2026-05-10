package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Password string `gorm:"size:255;not null" json:"-"`
	Email    string `gorm:"size:100" json:"email"`
	Phone    string `gorm:"size:20" json:"phone"`
	Avatar   string `gorm:"size:255" json:"avatar"`
	Nickname string `gorm:"size:50" json:"nickname"`
	Status   int    `gorm:"default:1" json:"status"`
}

type Admin struct {
	gorm.Model
	Username string `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Password string `gorm:"size:255;not null" json:"-"`
	Email    string `gorm:"size:100" json:"email"`
	Phone    string `gorm:"size:20" json:"phone"`
	Avatar   string `gorm:"size:255" json:"avatar"`
	Nickname string `gorm:"size:50" json:"nickname"`
	Role     string `gorm:"size:20;default:admin" json:"role"`
	Status   int    `gorm:"default:1" json:"status"`
}

type Publisher struct {
	gorm.Model
	Name        string `gorm:"size:100;not null" json:"name"`
	Contact     string `gorm:"size:50" json:"contact"`
	Phone       string `gorm:"size:20" json:"phone"`
	Email       string `gorm:"size:100" json:"email"`
	Description string `gorm:"type:text" json:"description"`
	Status      int    `gorm:"default:1" json:"status"`
}

type TaskType struct {
	gorm.Model
	Name        string `gorm:"size:50;not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`
	Icon        string `gorm:"size:255" json:"icon"`
	SortOrder   int    `gorm:"default:0" json:"sort_order"`
	Status      int    `gorm:"default:1" json:"status"`
}

type Task struct {
	gorm.Model
	Title          string  `gorm:"size:200;not null" json:"title"`
	Description    string  `gorm:"type:text" json:"description"`
	TaskTypeID     uint    `gorm:"not null" json:"task_type_id"`
	TaskType       TaskType `gorm:"foreignKey:TaskTypeID" json:"task_type"`
	PublisherID    uint    `gorm:"not null" json:"publisher_id"`
	Publisher      Publisher `gorm:"foreignKey:PublisherID" json:"publisher"`
	Reward         float64 `gorm:"not null" json:"reward"`
	Points         int     `gorm:"not null" json:"points"`
	Location       string  `gorm:"size:255" json:"location"`
	Latitude       float64 `json:"latitude"`
	Longitude      float64 `json:"longitude"`
	StartDate      string  `gorm:"size:20" json:"start_date"`
	EndDate        string  `gorm:"size:20" json:"end_date"`
	MaxParticipants int   `gorm:"default:0" json:"max_participants"`
	CurrentParticipants int `gorm:"default:0" json:"current_participants"`
	VideoURL       string  `gorm:"size:255" json:"video_url"`
	Thumbnail      string  `gorm:"size:255" json:"thumbnail"`
	Status         int     `gorm:"default:0" json:"status"`
	AuditStatus    int     `gorm:"default:0" json:"audit_status"`
	AuditRemark    string  `gorm:"type:text" json:"audit_remark"`
}

type TaskAssignment struct {
	gorm.Model
	UserID   uint   `gorm:"not null" json:"user_id"`
	User     User   `gorm:"foreignKey:UserID" json:"user"`
	TaskID   uint   `gorm:"not null" json:"task_id"`
	Task     Task   `gorm:"foreignKey:TaskID" json:"task"`
	Status   int    `gorm:"default:1" json:"status"`
	AcceptedAt string `gorm:"size:20" json:"accepted_at"`
	CompletedAt string `gorm:"size:20" json:"completed_at"`
}

type TaskResult struct {
	gorm.Model
	TaskAssignmentID uint           `gorm:"not null" json:"task_assignment_id"`
	TaskAssignment   TaskAssignment `gorm:"foreignKey:TaskAssignmentID" json:"task_assignment"`
	UserID           uint           `gorm:"not null" json:"user_id"`
	TaskID           uint           `gorm:"not null" json:"task_id"`
	ImageURLs        string         `gorm:"type:text" json:"image_urls"`
	VideoURL         string         `gorm:"size:255" json:"video_url"`
	Description      string         `gorm:"type:text" json:"description"`
	Latitude         float64        `json:"latitude"`
	Longitude        float64        `json:"longitude"`
	Status           int            `gorm:"default:0" json:"status"`
	AuditRemark      string         `gorm:"type:text" json:"audit_remark"`
}

type Favorite struct {
	gorm.Model
	UserID uint `gorm:"not null" json:"user_id"`
	TaskID uint `gorm:"not null" json:"task_id"`
	Task   Task `gorm:"foreignKey:TaskID" json:"task"`
}

type Banner struct {
	gorm.Model
	Title     string `gorm:"size:100;not null" json:"title"`
	ImageURL  string `gorm:"size:255;not null" json:"image_url"`
	Link      string `gorm:"size:255" json:"link"`
	SortOrder int    `gorm:"default:0" json:"sort_order"`
	Status    int    `gorm:"default:1" json:"status"`
}

type Announcement struct {
	gorm.Model
	Title    string `gorm:"size:200;not null" json:"title"`
	Content  string `gorm:"type:text;not null" json:"content"`
	Author   string `gorm:"size:50" json:"author"`
	Status   int    `gorm:"default:1" json:"status"`
	IsTop    int    `gorm:"default:0" json:"is_top"`
}

type Comment struct {
	gorm.Model
	TaskID      uint   `gorm:"not null" json:"task_id"`
	UserID      uint   `gorm:"not null" json:"user_id"`
	User        User   `gorm:"foreignKey:UserID" json:"user"`
	Content     string `gorm:"type:text;not null" json:"content"`
	Rating      int    `gorm:"default:5" json:"rating"`
	Status      int    `gorm:"default:1" json:"status"`
}
