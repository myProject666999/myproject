package model

import (
	"time"
)

const (
	UserStatusNormal = 1
	UserStatusDisabled = 2
)

const (
	AdminRoleSuper  = 1
	AdminRoleNormal = 2
)

const (
	OperatorStatusOnDuty  = 1
	OperatorStatusOffDuty = 2
	OperatorStatusVacation = 3
)

type User struct {
	ID           uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Phone        string     `gorm:"size:16;uniqueIndex" json:"phone"`
	Nickname     *string    `gorm:"size:64" json:"nickname"`
	RealName     *string    `gorm:"size:64" json:"real_name"`
	IDCard       *string    `gorm:"size:32" json:"id_card"`
	Avatar       *string    `gorm:"size:256" json:"avatar"`
	Status       int        `gorm:"type:tinyint" json:"status"`
	LastLoginAt  *time.Time `json:"last_login_at"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

func (User) TableName() string {
	return "user"
}

type Admin struct {
	ID           uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Username     string     `gorm:"size:64;uniqueIndex" json:"username"`
	Password     string     `gorm:"size:128" json:"password"`
	RealName     *string    `gorm:"size:64" json:"real_name"`
	Phone        *string    `gorm:"size:16" json:"phone"`
	Role         int        `gorm:"type:tinyint" json:"role"`
	Status       int        `gorm:"type:tinyint" json:"status"`
	LastLoginAt  *time.Time `json:"last_login_at"`
	LastLoginIP  *string    `gorm:"size:64" json:"last_login_ip"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

func (Admin) TableName() string {
	return "admin"
}

type Operator struct {
	ID               uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Name             string     `gorm:"size:64" json:"name"`
	Phone            string     `gorm:"size:16;uniqueIndex" json:"phone"`
	WorkArea         *string    `gorm:"size:128" json:"work_area"`
	Status           int        `gorm:"type:tinyint" json:"status"`
	CurrentLongitude *float64   `gorm:"type:decimal(10,7)" json:"current_longitude"`
	CurrentLatitude  *float64   `gorm:"type:decimal(10,7)" json:"current_latitude"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

func (Operator) TableName() string {
	return "operator"
}

type LoginReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResp struct {
	Token    string `json:"token"`
	UserID   uint64 `json:"user_id"`
	Username string `json:"username"`
	RealName string `json:"real_name"`
	Role     int    `json:"role"`
}
