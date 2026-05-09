package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password  string         `json:"-" gorm:"size:255;not null"`
	Role      string         `json:"role" gorm:"size:20;not null;default:'student'"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type Student struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	UserID       uint           `json:"user_id" gorm:"uniqueIndex;not null"`
	User         User           `json:"user,omitempty" gorm:"foreignKey:UserID"`
	RealName     string         `json:"real_name" gorm:"size:50"`
	StudentNo    string         `json:"student_no" gorm:"uniqueIndex;size:30"`
	Class        string         `json:"class" gorm:"size:50"`
	Phone        string         `json:"phone" gorm:"size:20"`
	Points       int            `json:"points" gorm:"default:0"`
	Avatar       string         `json:"avatar" gorm:"size:255"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type Admin struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"uniqueIndex;not null"`
	User      User           `json:"user,omitempty" gorm:"foreignKey:UserID"`
	RealName  string         `json:"real_name" gorm:"size:50"`
	Phone     string         `json:"phone" gorm:"size:20"`
	Email     string         `json:"email" gorm:"size:100"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type Notice struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	Title      string         `json:"title" gorm:"size:200;not null"`
	Content    string         `json:"content" gorm:"type:text"`
	Category   string         `json:"category" gorm:"size:50;default:'公告'"`
	Status     int            `json:"status" gorm:"default:1"`
	CreatedBy  uint           `json:"created_by"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

type AdvocateCategory struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"size:100;not null"`
	Sort      int            `json:"sort" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type Advocate struct {
	ID                 uint               `json:"id" gorm:"primaryKey"`
	Title              string             `json:"title" gorm:"size:200;not null"`
	Content            string             `json:"content" gorm:"type:text"`
	CategoryID         uint               `json:"category_id"`
	Category           AdvocateCategory   `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Thumbnail          string             `json:"thumbnail" gorm:"size:255"`
	VideoURL           string             `json:"video_url" gorm:"size:255"`
	Status             int                `json:"status" gorm:"default:1"`
	CreatedBy          uint               `json:"created_by"`
	Views              int                `json:"views" gorm:"default:0"`
	CreatedAt          time.Time          `json:"created_at"`
	UpdatedAt          time.Time          `json:"updated_at"`
	DeletedAt          gorm.DeletedAt     `json:"-" gorm:"index"`
}

type BagType struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"size:100;not null"`
	Color     string         `json:"color" gorm:"size:30"`
	Sort      int            `json:"sort" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type GarbageBag struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"size:200;not null"`
	TypeID      uint           `json:"type_id"`
	BagType     BagType        `json:"bag_type,omitempty" gorm:"foreignKey:TypeID"`
	Description string         `json:"description" gorm:"type:text"`
	Price       float64        `json:"price" gorm:"default:0"`
	Stock       int            `json:"stock" gorm:"default:0"`
	Image       string         `json:"image" gorm:"size:255"`
	Status      int            `json:"status" gorm:"default:1"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type BagPurchase struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	StudentID   uint           `json:"student_id"`
	Student     Student        `json:"student,omitempty" gorm:"foreignKey:StudentID"`
	BagID       uint           `json:"bag_id"`
	Bag         GarbageBag     `json:"bag,omitempty" gorm:"foreignKey:BagID"`
	Quantity    int            `json:"quantity" gorm:"default:1"`
	TotalPrice  float64        `json:"total_price"`
	Status      int            `json:"status" gorm:"default:1"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type TrashBin struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"size:100;not null"`
	Location  string         `json:"location" gorm:"size:200"`
	Status    int            `json:"status" gorm:"default:1"`
	Capacity  float64        `json:"capacity" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type ThrowRecord struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	StudentID  uint           `json:"student_id"`
	Student    Student        `json:"student,omitempty" gorm:"foreignKey:StudentID"`
	BinID      uint           `json:"bin_id"`
	Bin        TrashBin       `json:"bin,omitempty" gorm:"foreignKey:BinID"`
	GarbageType string        `json:"garbage_type" gorm:"size:50"`
	Weight     float64        `json:"weight" gorm:"default:0"`
	Points     int            `json:"points" gorm:"default:0"`
	Remark     string         `json:"remark" gorm:"size:500"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

type Product struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"size:200;not null"`
	Category    string         `json:"category" gorm:"size:100"`
	Description string         `json:"description" gorm:"type:text"`
	PointsPrice int            `json:"points_price" gorm:"default:0"`
	Stock       int            `json:"stock" gorm:"default:0"`
	Image       string         `json:"image" gorm:"size:255"`
	Status      int            `json:"status" gorm:"default:1"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type ExchangeRecord struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	StudentID   uint           `json:"student_id"`
	Student     Student        `json:"student,omitempty" gorm:"foreignKey:StudentID"`
	ProductID   uint           `json:"product_id"`
	Product     Product        `json:"product,omitempty" gorm:"foreignKey:ProductID"`
	Quantity    int            `json:"quantity" gorm:"default:1"`
	TotalPoints int            `json:"total_points"`
	Status      int            `json:"status" gorm:"default:0"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type CreativeType struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"size:100;not null"`
	Sort      int            `json:"sort" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type CreativeInfo struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	StudentID uint           `json:"student_id"`
	Student   Student        `json:"student,omitempty" gorm:"foreignKey:StudentID"`
	TypeID    uint           `json:"type_id"`
	Type      CreativeType   `json:"type,omitempty" gorm:"foreignKey:TypeID"`
	Title     string         `json:"title" gorm:"size:200;not null"`
	Content   string         `json:"content" gorm:"type:text"`
	Image     string         `json:"image" gorm:"size:255"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type SiteInfo struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Type      string         `json:"type" gorm:"uniqueIndex;size:50;not null"`
	Content   string         `json:"content" gorm:"type:text"`
	UpdatedAt time.Time      `json:"updated_at"`
}
