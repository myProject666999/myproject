package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password  string         `json:"-" gorm:"not null"`
	Email     string         `json:"email" gorm:"uniqueIndex;size:100"`
	Phone     string         `json:"phone" gorm:"size:20"`
	Nickname  string         `json:"nickname" gorm:"size:50"`
	Avatar    string         `json:"avatar" gorm:"size:255"`
	Role      string         `json:"role" gorm:"size:20;default:'member'"`
	Status    int            `json:"status" gorm:"default:1"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

func (u *User) HashPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

func (u *User) ComparePassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

type Category struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"size:50;not null"`
	ParentID  *uint          `json:"parent_id"`
	SortOrder int            `json:"sort_order" gorm:"default:0"`
	Status    int            `json:"status" gorm:"default:1"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	Children  []Category     `json:"children,omitempty" gorm:"-"`
}

type Product struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"size:100;not null"`
	Description string         `json:"description" gorm:"type:text"`
	Price       float64        `json:"price" gorm:"type:decimal(10,2);not null"`
	OriginalPrice float64    `json:"original_price" gorm:"type:decimal(10,2)"`
	Stock       int            `json:"stock" gorm:"default:0"`
	Sales       int            `json:"sales" gorm:"default:0"`
	CategoryID  uint           `json:"category_id"`
	Image       string         `json:"image" gorm:"size:255"`
	Images      string         `json:"images" gorm:"type:text"`
	Status      int            `json:"status" gorm:"default:1"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Banner struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Title     string         `json:"title" gorm:"size:100"`
	Image     string         `json:"image" gorm:"size:255;not null"`
	Link      string         `json:"link" gorm:"size:255"`
	SortOrder int            `json:"sort_order" gorm:"default:0"`
	Status    int            `json:"status" gorm:"default:1"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

type HotProduct struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	ProductID uint      `json:"product_id" gorm:"not null"`
	SortOrder int      `json:"sort_order" gorm:"default:0"`
	Status    int      `json:"status" gorm:"default:1"`
	CreatedAt time.Time `json:"created_at"`
	Product   Product    `json:"product" gorm:"foreignKey:ProductID"`
}

type NewProduct struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	ProductID uint      `json:"product_id" gorm:"not null"`
	SortOrder int      `json:"sort_order" gorm:"default:0"`
	Status    int      `json:"status" gorm:"default:1"`
	CreatedAt time.Time `json:"created_at"`
	Product   Product    `json:"product" gorm:"foreignKey:ProductID"`
}

type RecommendProduct struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	ProductID uint      `json:"product_id" gorm:"not null"`
	SortOrder int      `json:"sort_order" gorm:"default:0"`
	Status    int      `json:"status" gorm:"default:1"`
	CreatedAt time.Time `json:"created_at"`
	Product   Product    `json:"product" gorm:"foreignKey:ProductID"`
}

type Cart struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null;index"`
	ProductID uint          `json:"product_id" gorm:"not null"`
	Quantity  int            `json:"quantity" gorm:"default:1"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	Product   Product        `json:"product" gorm:"foreignKey:ProductID"`
}

type Address struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     uint           `json:"user_id" gorm:"not null;index"`
	Name       string         `json:"name" gorm:"size:50;not null"`
	Phone      string         `json:"phone" gorm:"size:20;not null"`
	Province   string         `json:"province" gorm:"size:50"`
	City       string         `json:"city" gorm:"size:50"`
	District   string         `json:"district" gorm:"size:50"`
	Detail     string         `json:"detail" gorm:"size:255;not null"`
	IsDefault  int            `json:"is_default" gorm:"default:0"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
}

type Order struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	OrderNo     string         `json:"order_no" gorm:"uniqueIndex;size:50;not null"`
	UserID      uint           `json:"user_id" gorm:"not null;index"`
	TotalAmount float64       `json:"total_amount" gorm:"type:decimal(10,2);not null"`
	Status      int            `json:"status" gorm:"default:0"`
	PayStatus   int            `json:"pay_status" gorm:"default:0"`
	PayType     string         `json:"pay_type" gorm:"size:20"`
	AddressInfo   string         `json:"address_info" gorm:"type:text"`
	Remark      string         `json:"remark" gorm:"size:255"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Items       []OrderItem    `json:"items" gorm:"foreignKey:OrderID"`
}

type OrderItem struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	OrderID     uint           `json:"order_id" gorm:"not null;index"`
	ProductID   uint           `json:"product_id" gorm:"not null"`
	ProductName string         `json:"product_name" gorm:"size:100;not null"`
	ProductImage string        `json:"product_image" gorm:"size:255"`
	Price       float64        `json:"price" gorm:"type:decimal(10,2);not null"`
	Quantity    int            `json:"quantity" gorm:"not null"`
	CreatedAt   time.Time      `json:"created_at"`
}

type Payment struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	OrderID     uint           `json:"order_id" gorm:"not null;index"`
	OrderNo     string         `json:"order_no" gorm:"size:50"`
	PayNo       string         `json:"pay_no" gorm:"size:100"`
	PayType     string         `json:"pay_type" gorm:"size:20"`
	Amount      float64        `json:"amount" gorm:"type:decimal(10,2);not null"`
	Status      int            `json:"status" gorm:"default:0"`
	PayTime     time.Time     `json:"pay_time"`
	CreatedAt   time.Time      `json:"created_at"`
}
