package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	Username        string         `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password        string         `json:"-" gorm:"size:255;not null"`
	Email           string         `json:"email" gorm:"uniqueIndex;size:100"`
	Phone           string         `json:"phone" gorm:"size:20"`
	Avatar          string         `json:"avatar" gorm:"size:500"`
	Nickname        string         `json:"nickname" gorm:"size:50"`
	Role            string         `json:"role" gorm:"size:20;default:user"`
	Status          int            `json:"status" gorm:"default:1"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
	Addresses       []Address      `json:"addresses,omitempty" gorm:"foreignKey:UserID"`
	Favorites       []Favorite     `json:"favorites,omitempty" gorm:"foreignKey:UserID"`
	Orders          []Order        `json:"orders,omitempty" gorm:"foreignKey:UserID"`
}

type Address struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"index;not null"`
	Name      string         `json:"name" gorm:"size:50;not null"`
	Phone     string         `json:"phone" gorm:"size:20;not null"`
	Province  string         `json:"province" gorm:"size:50"`
	City      string         `json:"city" gorm:"size:50"`
	District  string         `json:"district" gorm:"size:50"`
	Detail    string         `json:"detail" gorm:"size:255;not null"`
	IsDefault int            `json:"is_default" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type Category struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"uniqueIndex;size:50;not null"`
	Description string         `json:"description" gorm:"size:255"`
	ParentID    uint           `json:"parent_id" gorm:"default:0"`
	Status      int            `json:"status" gorm:"default:1"`
	Sort        int            `json:"sort" gorm:"default:0"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Products    []Product      `json:"products,omitempty" gorm:"foreignKey:CategoryID"`
}

type Product struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"size:200;not null"`
	Description string         `json:"description" gorm:"type:text"`
	Price       float64        `json:"price" gorm:"type:decimal(10,2);not null"`
	OriginalPrice float64     `json:"original_price" gorm:"type:decimal(10,2)"`
	Stock       int            `json:"stock" gorm:"default:0"`
	Sales       int            `json:"sales" gorm:"default:0"`
	Image       string         `json:"image" gorm:"size:500"`
	Images      string         `json:"images" gorm:"type:text"`
	CategoryID  uint           `json:"category_id" gorm:"index;not null"`
	SellerID    uint           `json:"seller_id" gorm:"index"`
	Status      int            `json:"status" gorm:"default:1"`
	Views       int            `json:"views" gorm:"default:0"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	Category    *Category      `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Comments    []Comment      `json:"comments,omitempty" gorm:"foreignKey:ProductID"`
}

type Comment struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"index;not null"`
	ProductID uint           `json:"product_id" gorm:"index;not null"`
	OrderID   uint           `json:"order_id" gorm:"index"`
	Content   string         `json:"content" gorm:"type:text;not null"`
	Rating    int            `json:"rating" gorm:"default:5"`
	Images    string         `json:"images" gorm:"type:text"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	User      *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Product   *Product       `json:"product,omitempty" gorm:"foreignKey:ProductID"`
}

type Favorite struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"index;not null"`
	ProductID uint           `json:"product_id" gorm:"index;not null"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	Product   *Product       `json:"product,omitempty" gorm:"foreignKey:ProductID"`
}

type Cart struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"index;not null"`
	ProductID uint           `json:"product_id" gorm:"index;not null"`
	Quantity  int            `json:"quantity" gorm:"default:1"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	Product   *Product       `json:"product,omitempty" gorm:"foreignKey:ProductID"`
}

type Order struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	OrderNo        string         `json:"order_no" gorm:"uniqueIndex;size:50;not null"`
	UserID         uint           `json:"user_id" gorm:"index;not null"`
	TotalPrice     float64        `json:"total_price" gorm:"type:decimal(10,2);not null"`
	Status         int            `json:"status" gorm:"default:0"`
	PaymentStatus  int            `json:"payment_status" gorm:"default:0"`
	PaymentMethod  string         `json:"payment_method" gorm:"size:50"`
	PaymentTime    *time.Time     `json:"payment_time"`
	AddressInfo    string         `json:"address_info" gorm:"type:text"`
	TrackingNumber string         `json:"tracking_number" gorm:"size:100"`
	ShippingTime   *time.Time     `json:"shipping_time"`
	CompleteTime   *time.Time     `json:"complete_time"`
	Remark         string         `json:"remark" gorm:"size:255"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
	Items          []OrderItem    `json:"items,omitempty" gorm:"foreignKey:OrderID"`
	User           *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

type OrderItem struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	OrderID     uint           `json:"order_id" gorm:"index;not null"`
	ProductID   uint           `json:"product_id" gorm:"index;not null"`
	ProductName string         `json:"product_name" gorm:"size:200;not null"`
	ProductImage string        `json:"product_image" gorm:"size:500"`
	Price       float64        `json:"price" gorm:"type:decimal(10,2);not null"`
	Quantity    int            `json:"quantity" gorm:"default:1"`
	Subtotal    float64        `json:"subtotal" gorm:"type:decimal(10,2);not null"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Banner struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Title     string         `json:"title" gorm:"size:200;not null"`
	Image     string         `json:"image" gorm:"size:500;not null"`
	Link      string         `json:"link" gorm:"size:500"`
	Sort      int            `json:"sort" gorm:"default:0"`
	Status    int            `json:"status" gorm:"default:1"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type News struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"size:500;not null"`
	Content     string         `json:"content" gorm:"type:text;not null"`
	Author      string         `json:"author" gorm:"size:50"`
	Image       string         `json:"image" gorm:"size:500"`
	Views       int            `json:"views" gorm:"default:0"`
	Status      int            `json:"status" gorm:"default:1"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Payment struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	OrderID       uint           `json:"order_id" gorm:"index;not null"`
	PaymentNo     string         `json:"payment_no" gorm:"uniqueIndex;size:50;not null"`
	Amount        float64        `json:"amount" gorm:"type:decimal(10,2);not null"`
	Method        string         `json:"method" gorm:"size:50"`
	Status        int            `json:"status" gorm:"default:0"`
	PaymentTime   *time.Time     `json:"payment_time"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}
