package models

import (
	"gorm.io/gorm"
)

type Admin struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Username string `json:"username" gorm:"unique;size:50;not null"`
	Password string `json:"-" gorm:"size:255;not null"`
	Name     string `json:"name" gorm:"size:50"`
	Phone    string `json:"phone" gorm:"size:20"`
	Role     string `json:"role" gorm:"size:20;default:admin"`
	CreatedAt string `json:"created_at" gorm:"-"`
}

type User struct {
	ID           uint   `json:"id" gorm:"primaryKey"`
	UserNo       string `json:"user_no" gorm:"unique;size:30;not null"`
	Username     string `json:"username" gorm:"size:50;not null"`
	Password     string `json:"-" gorm:"size:255;not null"`
	RealName     string `json:"real_name" gorm:"size:50"`
	Phone        string `json:"phone" gorm:"size:20"`
	Address      string `json:"address" gorm:"size:200"`
	CommunityID  uint   `json:"community_id"`
	Community    Community `json:"community" gorm:"foreignKey:CommunityID"`
	Status       string `json:"status" gorm:"size:20;default:active"`
	CreatedAt    string `json:"created_at" gorm:"-"`
}

type Community struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	CommunityNo string `json:"community_no" gorm:"unique;size:30;not null"`
	Name        string `json:"name" gorm:"size:100;not null"`
	Address     string `json:"address" gorm:"size:200"`
	Description string `json:"description" gorm:"size:500"`
}

type SettlementType struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	TypeCode    string `json:"type_code" gorm:"unique;size:30;not null"`
	TypeName    string `json:"type_name" gorm:"size:100;not null"`
	Description string `json:"description" gorm:"size:500"`
}

type WaterPrice struct {
	ID               uint    `json:"id" gorm:"primaryKey"`
	PriceCode        string  `json:"price_code" gorm:"unique;size:30;not null"`
	PriceName        string  `json:"price_name" gorm:"size:100;not null"`
	UnitPrice        float64 `json:"unit_price" gorm:"not null"`
	SettlementTypeID uint    `json:"settlement_type_id"`
	SettlementType   SettlementType `json:"settlement_type" gorm:"foreignKey:SettlementTypeID"`
	Description      string  `json:"description" gorm:"size:500"`
	EffectiveDate    string  `json:"effective_date" gorm:"size:20"`
}

type WaterMeter struct {
	ID            uint   `json:"id" gorm:"primaryKey"`
	MeterNo       string `json:"meter_no" gorm:"unique;size:30;not null"`
	UserID        uint   `json:"user_id"`
	User          User   `json:"user" gorm:"foreignKey:UserID"`
	InstallDate   string `json:"install_date" gorm:"size:20"`
	InitialReading float64 `json:"initial_reading"`
	Status        string `json:"status" gorm:"size:20;default:normal"`
	Location      string `json:"location" gorm:"size:200"`
}

type WaterBill struct {
	ID             uint    `json:"id" gorm:"primaryKey"`
	BillNo           string  `json:"bill_no" gorm:"unique;size:30;not null"`
	UserID           uint    `json:"user_id"`
	User             User    `json:"user" gorm:"foreignKey:UserID"`
	MeterID          uint    `json:"meter_id"`
	Meter            WaterMeter `json:"meter" gorm:"foreignKey:MeterID"`
	WaterPriceID     uint    `json:"water_price_id"`
	WaterPrice       WaterPrice `json:"water_price" gorm:"foreignKey:WaterPriceID"`
	PreviousReading  float64 `json:"previous_reading"`
	CurrentReading   float64 `json:"current_reading"`
	WaterUsage       float64 `json:"water_usage"`
	UnitPrice        float64 `json:"unit_price"`
	TotalAmount      float64 `json:"total_amount"`
	BillingDate      string  `json:"billing_date" gorm:"size:20"`
	Status           string  `json:"status" gorm:"size:20;default:unpaid"`
	PaidDate         string  `json:"paid_date" gorm:"size:20"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func AutoMigrate(db *gorm.DB) {
	db.AutoMigrate(&Admin{}, &User{}, &Community{}, &SettlementType{}, &WaterPrice{}, &WaterMeter{}, &WaterBill{})
}
