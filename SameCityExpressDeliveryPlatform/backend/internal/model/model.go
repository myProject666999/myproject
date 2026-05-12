package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Username     string         `gorm:"size:50;uniqueIndex;not null" json:"username"`
	Password     string         `gorm:"size:255;not null" json:"-"`
	Phone        string         `gorm:"size:20;uniqueIndex;not null" json:"phone"`
	Nickname     string         `gorm:"size:50" json:"nickname"`
	Avatar       string         `gorm:"size:255" json:"avatar"`
	Balance      float64        `gorm:"default:0" json:"balance"`
	Status       int            `gorm:"default:1" json:"status"` // 1:正常 2:禁用
	IsVip        bool           `gorm:"default:false" json:"is_vip"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

type Rider struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	Username        string         `gorm:"size:50;uniqueIndex;not null" json:"username"`
	Password        string         `gorm:"size:255;not null" json:"-"`
	Phone           string         `gorm:"size:20;uniqueIndex;not null" json:"phone"`
	RealName        string         `gorm:"size:50" json:"real_name"`
	IDCard          string         `gorm:"size:20" json:"-"`
	Avatar          string         `gorm:"size:255" json:"avatar"`
	Balance         float64        `gorm:"default:0" json:"balance"`
	Status          int            `gorm:"default:1" json:"status"`          // 1:正常 2:审核中 3:禁用
	OnlineStatus    int            `gorm:"default:0" json:"online_status"`   // 0:离线 1:在线 2:接单中
	OrderCount      int            `gorm:"default:0" json:"order_count"`
	CompleteCount   int            `gorm:"default:0" json:"complete_count"`
	CancelCount     int            `gorm:"default:0" json:"cancel_count"`
	Income          float64        `gorm:"default:0" json:"income"`
	Rating          float64        `gorm:"default:5.0" json:"rating"`
	RatingCount     int            `gorm:"default:0" json:"rating_count"`
	Longitude       float64        `gorm:"type:decimal(10,7)" json:"longitude"`
	Latitude        float64        `gorm:"type:decimal(10,7)" json:"latitude"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

type Admin struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Username  string         `gorm:"size:50;uniqueIndex;not null" json:"username"`
	Password  string         `gorm:"size:255;not null" json:"-"`
	RealName  string         `gorm:"size:50" json:"real_name"`
	Role      int            `gorm:"default:1" json:"role"` // 1:普通管理员 2:超级管理员
	Status    int            `gorm:"default:1" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Address struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	UserID      uint           `gorm:"index;not null" json:"user_id"`
	Name        string         `gorm:"size:50;not null" json:"name"`
	Phone       string         `gorm:"size:20;not null" json:"phone"`
	Province    string         `gorm:"size:50" json:"province"`
	City        string         `gorm:"size:50" json:"city"`
	District    string         `gorm:"size:50" json:"district"`
	Detail      string         `gorm:"size:255;not null" json:"detail"`
	Longitude   float64        `gorm:"type:decimal(10,7);not null" json:"longitude"`
	Latitude    float64        `gorm:"type:decimal(10,7);not null" json:"latitude"`
	IsDefault   bool           `gorm:"default:false" json:"is_default"`
	Tag         string         `gorm:"size:20" json:"tag"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Order struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	OrderNo         string         `gorm:"size:32;uniqueIndex;not null" json:"order_no"`
	UserID          uint           `gorm:"index;not null" json:"user_id"`
	RiderID         uint           `gorm:"index" json:"rider_id"`

	PickupName      string         `gorm:"size:50;not null" json:"pickup_name"`
	PickupPhone     string         `gorm:"size:20;not null" json:"pickup_phone"`
	PickupAddress   string         `gorm:"size:255;not null" json:"pickup_address"`
	PickupLongitude float64        `gorm:"type:decimal(10,7);not null" json:"pickup_longitude"`
	PickupLatitude  float64        `gorm:"type:decimal(10,7);not null" json:"pickup_latitude"`

	DeliveryName      string       `gorm:"size:50;not null" json:"delivery_name"`
	DeliveryPhone     string       `gorm:"size:20;not null" json:"delivery_phone"`
	DeliveryAddress   string       `gorm:"size:255;not null" json:"delivery_address"`
	DeliveryLongitude float64      `gorm:"type:decimal(10,7);not null" json:"delivery_longitude"`
	DeliveryLatitude  float64      `gorm:"type:decimal(10,7);not null" json:"delivery_latitude"`

	ItemType        int            `gorm:"not null" json:"item_type"` // 1:文件 2:鲜花 3:食品 4:其他
	ItemName        string         `gorm:"size:100" json:"item_name"`
	ItemWeight      float64        `gorm:"type:decimal(10,2);default:0" json:"item_weight"`
	ItemValue       float64        `gorm:"type:decimal(10,2);default:0" json:"item_value"`
	ItemQuantity    int            `gorm:"default:1" json:"item_quantity"`
	Remark          string         `gorm:"size:500" json:"remark"`
	RequireTime     time.Time      `json:"require_time"`

	Distance        float64        `gorm:"type:decimal(10,2);default:0" json:"distance"`
	EstimatedTime   int            `gorm:"default:0" json:"estimated_time"`
	BasePrice       float64        `gorm:"type:decimal(10,2);default:0" json:"base_price"`
	DistancePrice   float64        `gorm:"type:decimal(10,2);default:0" json:"distance_price"`
	WeightPrice     float64        `gorm:"type:decimal(10,2);default:0" json:"weight_price"`
	TimeSurcharge   float64        `gorm:"type:decimal(10,2);default:0" json:"time_surcharge"`
	TotalPrice      float64        `gorm:"type:decimal(10,2);default:0" json:"total_price"`
	PlatformFee     float64        `gorm:"type:decimal(10,2);default:0" json:"platform_fee"`
	RiderIncome     float64        `gorm:"type:decimal(10,2);default:0" json:"rider_income"`

	Status          int            `gorm:"default:0;index" json:"status"`
	/*
	0: 待接单
	1: 已接单
	2: 取件中
	3: 已取件
	4: 配送中
	5: 待签收
	6: 已完成
	7: 已取消
	8: 异常
	*/

	SignCode        string         `gorm:"size:6" json:"sign_code"`
	PickupPhoto     string         `gorm:"size:255" json:"pickup_photo"`
	DeliveryPhoto   string         `gorm:"size:255" json:"delivery_photo"`

	PickupTime      *time.Time     `json:"pickup_time"`
	DeliverTime     *time.Time     `json:"deliver_time"`
	CompleteTime    *time.Time     `json:"complete_time"`
	CancelTime      *time.Time     `json:"cancel_time"`
	CancelReason    string         `gorm:"size:255" json:"cancel_reason"`

	Rating          int            `json:"rating"`
	Comment         string         `gorm:"size:500" json:"comment"`
	RatingTime      *time.Time     `json:"rating_time"`

	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	User            *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Rider           *Rider         `gorm:"foreignKey:RiderID" json:"rider,omitempty"`
}

type OrderTrack struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	OrderID   uint           `gorm:"index;not null" json:"order_id"`
	Status    int            `gorm:"not null" json:"status"`
	Content   string         `gorm:"size:255;not null" json:"content"`
	Longitude float64        `gorm:"type:decimal(10,7)" json:"longitude"`
	Latitude  float64        `gorm:"type:decimal(10,7)" json:"latitude"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type ExceptionOrder struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	OrderID        uint           `gorm:"index;not null" json:"order_id"`
	UserID         uint           `gorm:"index;not null" json:"user_id"`
	RiderID        uint           `gorm:"index" json:"rider_id"`
	Type           int            `gorm:"not null" json:"type"` // 1:丢件 2:超时 3:损坏 4:其他
	Description    string         `gorm:"size:1000;not null" json:"description"`
	Photos         string         `gorm:"size:1000" json:"photos"`
	Status         int            `gorm:"default:0;index" json:"status"`
	/*
	0: 待处理
	1: 处理中
	2: 已解决
	3: 已驳回
	*/
	HandleAdminID  uint           `gorm:"index" json:"handle_admin_id"`
	HandleResult   string         `gorm:"size:1000" json:"handle_result"`
	HandleTime     *time.Time     `json:"handle_time"`
	Compensation   float64        `gorm:"type:decimal(10,2);default:0" json:"compensation"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	Order          *Order         `gorm:"foreignKey:OrderID" json:"order,omitempty"`
}

type RiderLocation struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	RiderID   uint           `gorm:"index;not null" json:"rider_id"`
	Longitude float64        `gorm:"type:decimal(10,7);not null" json:"longitude"`
	Latitude  float64        `gorm:"type:decimal(10,7);not null" json:"latitude"`
	CreatedAt time.Time      `gorm:"index" json:"created_at"`
}

type PricingRule struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Name          string         `gorm:"size:100;not null" json:"name"`
	BasePrice     float64        `gorm:"type:decimal(10,2);not null" json:"base_price"`
	BaseDistance  float64        `gorm:"type:decimal(10,2);default:3" json:"base_distance"`
	DistancePrice float64        `gorm:"type:decimal(10,2);not null" json:"distance_price"`
	BaseWeight    float64        `gorm:"type:decimal(10,2);default:5" json:"base_weight"`
	WeightPrice   float64        `gorm:"type:decimal(10,2);not null" json:"weight_price"`
	TimeSurcharge float64        `gorm:"type:decimal(10,2);default:0" json:"time_surcharge"`
	StartTime     string         `gorm:"size:5" json:"start_time"`
	EndTime       string         `gorm:"size:5" json:"end_time"`
	IsEnabled     bool           `gorm:"default:true" json:"is_enabled"`
	Priority      int            `gorm:"default:0" json:"priority"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type Notification struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	UserID        uint           `gorm:"index" json:"user_id"`
	RiderID       uint           `gorm:"index" json:"rider_id"`
	Type          int            `gorm:"not null" json:"type"`
	Title         string         `gorm:"size:100;not null" json:"title"`
	Content       string         `gorm:"size:500;not null" json:"content"`
	OrderID       uint           `gorm:"index" json:"order_id"`
	IsRead        bool           `gorm:"default:false" json:"is_read"`
	CreatedAt     time.Time      `json:"created_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type WalletRecord struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	UserID        uint           `gorm:"index" json:"user_id"`
	RiderID       uint           `gorm:"index" json:"rider_id"`
	Type          int            `gorm:"not null" json:"type"`
	Amount        float64        `gorm:"type:decimal(10,2);not null" json:"amount"`
	Balance       float64        `gorm:"type:decimal(10,2);not null" json:"balance"`
	Description   string         `gorm:"size:255" json:"description"`
	OrderID       uint           `gorm:"index" json:"order_id"`
	CreatedAt     time.Time      `json:"created_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}
