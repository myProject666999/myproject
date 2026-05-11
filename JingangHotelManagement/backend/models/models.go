package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Password string `gorm:"size:255;not null" json:"password"`
	RealName string `gorm:"size:50" json:"realName"`
	Phone    string `gorm:"size:20" json:"phone"`
	Email    string `gorm:"size:100" json:"email"`
	Avatar   string `gorm:"size:255" json:"avatar"`
	MemberLevel    int    `gorm:"default:1" json:"memberLevel"`
	MemberPoints int    `gorm:"default:0" json:"memberPoints"`
	Status       int    `gorm:"default:1" json:"status"`
}

type Admin struct {
	gorm.Model
	Username string `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Password string `gorm:"size:255;not null" json:"password"`
	RealName string `gorm:"size:50" json:"realName"`
	IsSuper  int    `gorm:"default:0" json:"isSuper"`
	Status    int    `gorm:"default:1" json:"status"`
}

type RoomType struct {
	gorm.Model
	Name        string  `gorm:"size:100;not null" json:"name"`
	Description string  `gorm:"size:500" json:"description"`
	Price       float64 `gorm:"not null" json:"price"`
	Capacity    int     `gorm:"default:1" json:"capacity"`
	Facilities  string  `gorm:"size:500" json:"facilities"`
	Image       string  `gorm:"size:255" json:"image"`
	Status      int     `gorm:"default:1" json:"status"`
}

type Room struct {
	gorm.Model
	RoomNumber string `gorm:"uniqueIndex;size:20;not null" json:"roomNumber"`
	RoomTypeID uint   `gorm:"not null" json:"roomTypeId"`
	RoomType   RoomType
	Floor      int    `gorm:"not null" json:"floor"`
	Status     int    `gorm:"default:1" json:"status"`
}

type Order struct {
	gorm.Model
	OrderNo    string    `gorm:"uniqueIndex;size:50;not null" json:"orderNo"`
	UserID     uint      `gorm:"not null" json:"userId"`
	User       User
	RoomID     uint      `gorm:"not null" json:"roomId"`
	Room       Room
	CheckIn    time.Time `gorm:"not null" json:"checkIn"`
	CheckOut   time.Time `gorm:"not null" json:"checkOut"`
	TotalPrice float64   `gorm:"not null" json:"totalPrice"`
	Status     int       `gorm:"default:0" json:"status"`
	Remark     string    `gorm:"size:500" json:"remark"`
	GuestName  string    `gorm:"size:50" json:"guestName"`
	GuestPhone string    `gorm:"size:20" json:"guestPhone"`
}

type Review struct {
	gorm.Model
	UserID    uint   `gorm:"not null" json:"userId"`
	User      User
	OrderID   uint   `gorm:"not null" json:"orderId"`
	Order     Order
	Rating    int    `gorm:"not null" json:"rating"`
	Content   string `gorm:"size:1000" json:"content"`
	Status    int    `gorm:"default:0" json:"status"`
	Reply     string `gorm:"size:500" json:"reply"`
}

type Product struct {
	gorm.Model
	Name        string  `gorm:"size:100;not null" json:"name"`
	Description string  `gorm:"size:500" json:"description"`
	Points      int     `gorm:"not null" json:"points"`
	Stock       int     `gorm:"default:0" json:"stock"`
	Image       string  `gorm:"size:255" json:"image"`
	Status      int     `gorm:"default:1" json:"status"`
}

type ProductOrder struct {
	gorm.Model
	OrderNo     string `gorm:"uniqueIndex;size:50;not null" json:"orderNo"`
	UserID      uint   `gorm:"not null" json:"userId"`
	User        User
	ProductID   uint   `gorm:"not null" json:"productId"`
	Product     Product
	Quantity    int    `gorm:"default:1" json:"quantity"`
	TotalPoints int   `gorm:"not null" json:"totalPoints"`
	Status      int    `gorm:"default:1" json:"status"`
}

type PointsRecord struct {
	gorm.Model
	UserID   uint   `gorm:"not null" json:"userId"`
	User     User
	Type     int    `gorm:"not null" json:"type"`
	Points   int    `gorm:"not null" json:"points"`
	Reason   string `gorm:"size:200" json:"reason"`
	OrderID  uint   `json:"orderId"`
}
