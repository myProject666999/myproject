package models

import (
	"time"
)

type User struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	Username  string    `gorm:"unique;not null" json:"username"`
	Password  string    `json:"-"`
	Role      string    `gorm:"default:'user'" json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type Category struct {
	ID   uint   `gorm:"primary_key" json:"id"`
	Name string `gorm:"unique;not null" json:"name"`
}

type Game struct {
	ID          uint      `gorm:"primary_key" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Price       float64   `gorm:"not null" json:"price"`
	Image       string    `json:"image"`
	CategoryID  uint      `json:"category_id"`
	Category    Category  `gorm:"foreignKey:CategoryID" json:"category"`
	CreatedAt   time.Time `json:"created_at"`
}

type CartItem struct {
	ID        uint `gorm:"primary_key" json:"id"`
	UserID    uint `json:"user_id"`
	GameID    uint `json:"game_id"`
	Game      Game `gorm:"foreignKey:GameID" json:"game"`
	Quantity  int  `gorm:"default:1" json:"quantity"`
}

type Order struct {
	ID         uint      `gorm:"primary_key" json:"id"`
	UserID     uint      `json:"user_id"`
	User       User      `gorm:"foreignKey:UserID" json:"user"`
	TotalPrice float64   `json:"total_price"`
	Status     string    `gorm:"default:'pending'" json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	Items      []OrderItem `gorm:"foreignKey:OrderID" json:"items"`
}

type OrderItem struct {
	ID       uint    `gorm:"primary_key" json:"id"`
	OrderID  uint    `json:"order_id"`
	GameID   uint    `json:"game_id"`
	Game     Game    `gorm:"foreignKey:GameID" json:"game"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
}

type News struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	Title     string    `gorm:"not null" json:"title"`
	Content   string    `gorm:"type:text" json:"content"`
	CreatedAt time.Time `json:"created_at"`
}
