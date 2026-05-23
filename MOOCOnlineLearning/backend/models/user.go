package models

import (
	"time"

	"gorm.io/gorm"
)

type Role struct {
	ID          uint64    `gorm:"primaryKey;column:id" json:"id"`
	Name        string    `gorm:"size:50;not null;column:name" json:"name"`
	Code        string    `gorm:"size:50;uniqueIndex:uk_role_code;not null;column:code" json:"code"`
	Description string    `gorm:"size:200;column:description" json:"description"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (Role) TableName() string { return "roles" }

type User struct {
	ID           uint64         `gorm:"primaryKey;column:id" json:"id"`
	Username     string         `gorm:"size:50;uniqueIndex:uk_username;not null;column:username" json:"username"`
	Password     string         `gorm:"size:255;not null;column:password" json:"-"`
	Email        string         `gorm:"size:100;index:idx_email;column:email" json:"email"`
	Phone        string         `gorm:"size:20;index:idx_phone;column:phone" json:"phone"`
	Avatar       string         `gorm:"size:500;column:avatar" json:"avatar"`
	Nickname     string         `gorm:"size:50;column:nickname" json:"nickname"`
	Role         string         `gorm:"size:20;default:student;column:role" json:"role"`
	Gender       uint8          `gorm:"default:0;not null;column:gender" json:"gender"`
	Bio          string         `gorm:"size:500;column:bio" json:"bio"`
	Status       uint8          `gorm:"default:1;not null;index:idx_status;column:status" json:"status"`
	LastLoginAt  *time.Time     `gorm:"column:last_login_at" json:"last_login_at"`
	LastLoginIP  string         `gorm:"size:50;column:last_login_ip" json:"last_login_ip"`
	CreatedAt    time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt    time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
}

func (User) TableName() string { return "users" }

type UserPublic struct {
	ID        uint64 `json:"id"`
	Username  string `json:"username"`
	Nickname  string `json:"nickname"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Avatar    string `json:"avatar"`
	Role      string `json:"role"`
	Bio       string `json:"bio"`
	Gender    uint8  `json:"gender"`
	CreatedAt time.Time `json:"created_at"`
}

func (u *User) PublicInfo() UserPublic {
	return UserPublic{
		ID:        u.ID,
		Username:  u.Username,
		Nickname:  u.Nickname,
		Email:     u.Email,
		Phone:     u.Phone,
		Avatar:    u.Avatar,
		Role:      u.Role,
		Bio:       u.Bio,
		Gender:    u.Gender,
		CreatedAt: u.CreatedAt,
	}
}

type UserRole struct {
	ID        uint64    `gorm:"primaryKey;column:id" json:"id"`
	UserID    uint64    `gorm:"not null;uniqueIndex:uk_user_role;column:user_id" json:"user_id"`
	RoleID    uint64    `gorm:"not null;uniqueIndex:uk_user_role;index:idx_role_id;column:role_id" json:"role_id"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
}

func (UserRole) TableName() string { return "user_roles" }

type Teacher struct {
	ID                 uint64    `gorm:"primaryKey;column:id" json:"id"`
	UserID             uint64    `gorm:"uniqueIndex:uk_user_id;not null;column:user_id" json:"user_id"`
	Title              string    `gorm:"size:50;column:title" json:"title"`
	Organization       string    `gorm:"size:100;column:organization" json:"organization"`
	YearsOfExperience  uint      `gorm:"default:0;column:years_of_experience" json:"years_of_experience"`
	Specialties        string    `gorm:"size:500;column:specialties" json:"specialties"`
	Certification      string    `gorm:"size:500;column:certification" json:"certification"`
	CreatedAt          time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt          time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (Teacher) TableName() string { return "teachers" }
