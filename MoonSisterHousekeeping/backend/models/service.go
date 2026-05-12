package models

import "time"

type Attendance struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	OrderID   uint      `json:"order_id"`
	NannyID   uint      `json:"nanny_id"`
	Date      time.Time `json:"date"`
	CheckIn   *time.Time `json:"check_in"`
	CheckOut  *time.Time `json:"check_out"`
	Location  string    `json:"location" gorm:"size:255"`
	Status    string    `json:"status" gorm:"size:20"`
	CreatedAt time.Time `json:"created_at"`
}

type DailyRecord struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	OrderID     uint      `json:"order_id"`
	NannyID     uint      `json:"nanny_id"`
	Date        time.Time `json:"date"`
	BabyCare    string    `json:"baby_care" gorm:"type:text"`
	MotherCare  string    `json:"mother_care" gorm:"type:text"`
	Housework   string    `json:"housework" gorm:"type:text"`
	Meals       string    `json:"meals" gorm:"type:text"`
	Notes       string    `json:"notes" gorm:"type:text"`
	Photos      string    `json:"photos" gorm:"size:1000"`
	CustomerReview string `json:"customer_review" gorm:"size:500"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Review struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	OrderID     uint      `json:"order_id"`
	CustomerID  uint      `json:"customer_id"`
	NannyID     uint      `json:"nanny_id"`
	Rating      int       `json:"rating"`
	Content     string    `json:"content" gorm:"type:text"`
	Photos      string    `json:"photos" gorm:"size:1000"`
	Tags        string    `json:"tags" gorm:"size:255"`
	IsAnonymous bool      `json:"is_anonymous" gorm:"default:false"`
	Reply       string    `json:"reply" gorm:"type:text"`
	ReplyAt     *time.Time `json:"reply_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Dispute struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	OrderID     uint      `json:"order_id"`
	CustomerID  uint      `json:"customer_id"`
	Type        string    `json:"type" gorm:"size:50"`
	Title       string    `json:"title" gorm:"size:200"`
	Description string    `json:"description" gorm:"type:text"`
	Evidence    string    `json:"evidence" gorm:"size:1000"`
	Status      string    `json:"status" gorm:"size:20"`
	HandlerID   uint      `json:"handler_id"`
	HandleResult string   `json:"handle_result" gorm:"type:text"`
	HandleAt    *time.Time `json:"handle_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
