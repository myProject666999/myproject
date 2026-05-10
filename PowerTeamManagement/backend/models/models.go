package models

import (
	"time"

	"gorm.io/gorm"
)

type Role string

const (
	RoleAdmin        Role = "admin"
	RoleSalesManager Role = "sales_manager"
	RoleSalesperson  Role = "salesperson"
)

type OpportunityStatus string

const (
	StatusNew          OpportunityStatus = "new"
	StatusInitial      OpportunityStatus = "initial_contact"
	StatusRequirement  OpportunityStatus = "requirement_analysis"
	StatusNegotiation  OpportunityStatus = "negotiation"
	StatusCommercial   OpportunityStatus = "commercial_negotiation"
	StatusCompleted    OpportunityStatus = "completed"
	StatusLost         OpportunityStatus = "lost"
)

type Organization struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"not null"`
	ParentID  *uint          `json:"parent_id"`
	Parent    *Organization  `json:"parent,omitempty" gorm:"foreignKey:ParentID"`
	Children  []Organization `json:"children,omitempty" gorm:"foreignKey:ParentID"`
	Users     []User         `json:"users,omitempty" gorm:"foreignKey:OrganizationID"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type User struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	Username       string         `json:"username" gorm:"uniqueIndex:idx_username;not null;type:varchar(100)"`
	Password       string         `json:"-" gorm:"not null;type:varchar(255)"`
	RealName       string         `json:"real_name" gorm:"not null;type:varchar(100)"`
	Email          string         `json:"email" gorm:"type:varchar(255)"`
	Phone          string         `json:"phone" gorm:"type:varchar(50)"`
	RoleID         uint           `json:"role_id"`
	Role           RoleModel      `json:"role,omitempty" gorm:"foreignKey:RoleID"`
	OrganizationID *uint          `json:"organization_id"`
	Organization   *Organization  `json:"organization,omitempty" gorm:"foreignKey:OrganizationID"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
}

type RoleModel struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"uniqueIndex:idx_role_name;not null;type:varchar(100)"`
	Code        string         `json:"code" gorm:"uniqueIndex:idx_role_code;not null;type:varchar(50)"`
	Description string         `json:"description" gorm:"type:text"`
	Users       []User         `json:"users,omitempty" gorm:"foreignKey:RoleID"`
	Menus       []Menu         `json:"menus,omitempty" gorm:"many2many:role_menus"`
	Permissions []Permission   `json:"permissions,omitempty" gorm:"many2many:role_permissions"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Menu struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	Name       string         `json:"name" gorm:"not null;type:varchar(100)"`
	Path       string         `json:"path" gorm:"type:varchar(255)"`
	Icon       string         `json:"icon" gorm:"type:varchar(50)"`
	ParentID   *uint          `json:"parent_id"`
	Parent     *Menu          `json:"parent,omitempty" gorm:"foreignKey:ParentID"`
	Children   []Menu         `json:"children,omitempty" gorm:"foreignKey:ParentID"`
	Sort       int            `json:"sort"`
	Roles      []RoleModel    `json:"roles,omitempty" gorm:"many2many:role_menus"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

type Permission struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null;type:varchar(100)"`
	Code        string         `json:"code" gorm:"uniqueIndex:idx_permission_code;not null;type:varchar(100)"`
	Description string         `json:"description" gorm:"type:text"`
	MenuID      *uint          `json:"menu_id"`
	Menu        *Menu          `json:"menu,omitempty" gorm:"foreignKey:MenuID"`
	Roles       []RoleModel    `json:"roles,omitempty" gorm:"many2many:role_permissions"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Customer struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null;type:varchar(200)"`
	Company     string         `json:"company" gorm:"type:varchar(200)"`
	Industry    string         `json:"industry" gorm:"type:varchar(100)"`
	Address     string         `json:"address" gorm:"type:varchar(500)"`
	Website     string         `json:"website" gorm:"type:varchar(200)"`
	Remark      string         `json:"remark" gorm:"type:text"`
	Contacts    []Contact      `json:"contacts,omitempty" gorm:"foreignKey:CustomerID"`
	Opportunities []Opportunity `json:"opportunities,omitempty" gorm:"foreignKey:CustomerID"`
	CreatedBy   uint           `json:"created_by"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Contact struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	CustomerID   uint           `json:"customer_id"`
	Customer     *Customer      `json:"customer,omitempty" gorm:"foreignKey:CustomerID"`
	Name         string         `json:"name" gorm:"not null;type:varchar(100)"`
	Position     string         `json:"position" gorm:"type:varchar(100)"`
	Phone        string         `json:"phone" gorm:"type:varchar(50)"`
	Email        string         `json:"email" gorm:"type:varchar(200)"`
	Wechat       string         `json:"wechat" gorm:"type:varchar(50)"`
	Address      string         `json:"address" gorm:"type:varchar(500)"`
	IsPrimary    bool           `json:"is_primary" gorm:"default:false"`
	Remark       string         `json:"remark" gorm:"type:text"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type Opportunity struct {
	ID             uint              `json:"id" gorm:"primaryKey"`
	Name           string            `json:"name" gorm:"not null;type:varchar(200)"`
	CustomerID     uint              `json:"customer_id"`
	Customer       *Customer         `json:"customer,omitempty" gorm:"foreignKey:CustomerID"`
	Status         OpportunityStatus `json:"status" gorm:"not null;default:new;type:varchar(50)"`
	Amount         float64           `json:"amount"`
	Probability    int               `json:"probability" gorm:"default:0"`
	ExpectedClose  *time.Time        `json:"expected_close"`
	Description    string            `json:"description" gorm:"type:text"`
	AssignedToID   uint              `json:"assigned_to_id"`
	AssignedTo     *User             `json:"assigned_to,omitempty" gorm:"foreignKey:AssignedToID"`
	CreatedByID    uint              `json:"created_by_id"`
	CreatedBy      *User             `json:"created_by,omitempty" gorm:"foreignKey:CreatedByID"`
	CreatedAt      time.Time         `json:"created_at"`
	UpdatedAt      time.Time         `json:"updated_at"`
	DeletedAt      gorm.DeletedAt    `json:"-" gorm:"index"`
}

type DailyReport struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	UserID       uint           `json:"user_id"`
	User         *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	ReportDate   time.Time      `json:"report_date"`
	Content      string         `json:"content" gorm:"type:text"`
	WorkProgress string         `json:"work_progress" gorm:"type:text"`
	PlanTomorrow string         `json:"plan_tomorrow" gorm:"type:text"`
	Problems     string         `json:"problems" gorm:"type:text"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}
