package models

import (
	"time"
)

type User struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Phone     string    `gorm:"size:20;not null;unique" json:"phone"`
	Nickname  string    `gorm:"size:50" json:"nickname"`
	Avatar    string    `gorm:"size:255" json:"avatar"`
	Status    int8      `gorm:"default:1" json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Restaurant struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name          string    `gorm:"size:100;not null" json:"name"`
	Address       string    `gorm:"size:255;not null" json:"address"`
	ContactPhone  string    `gorm:"size:20" json:"contact_phone"`
	BusinessHours string    `gorm:"size:100" json:"business_hours"`
	Description   string    `gorm:"type:text" json:"description"`
	CoverImage    string    `gorm:"size:255" json:"cover_image"`
	Status        int8      `gorm:"default:1" json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type TableType struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	RestaurantID  uint64    `gorm:"not null;index" json:"restaurant_id"`
	Name          string    `gorm:"size:50;not null" json:"name"`
	MinPeople     int       `gorm:"not null;default:1" json:"min_people"`
	MaxPeople     int       `gorm:"not null;default:2" json:"max_people"`
	SeatCount     int       `gorm:"not null;default:2" json:"seat_count"`
	QueuePrefix   string    `gorm:"size:10;not null;index" json:"queue_prefix"`
	TotalTables   int       `gorm:"not null;default:10" json:"total_tables"`
	AvgServeTime  int       `gorm:"not null;default:15" json:"avg_serve_time"`
	SortOrder     int       `gorm:"default:0" json:"sort_order"`
	Status        int8      `gorm:"default:1" json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type QueueSetting struct {
	ID               uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	RestaurantID     uint64    `gorm:"not null;unique" json:"restaurant_id"`
	MaxQueueLength   int       `gorm:"not null;default:50" json:"max_queue_length"`
	OverNumberLimit  int       `gorm:"not null;default:3" json:"over_number_limit"`
	MaxAdvanceDays   int       `gorm:"not null;default:7" json:"max_advance_days"`
	ReserveTimeGap   int       `gorm:"not null;default:30" json:"reserve_time_gap"`
	RateLimitSeconds int       `gorm:"not null;default:60" json:"rate_limit_seconds"`
	RateLimitCount   int       `gorm:"not null;default:1" json:"rate_limit_count"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type Queue struct {
	ID              uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	QueueNo         string     `gorm:"size:20;not null" json:"queue_no"`
	QueueNumber     int        `gorm:"not null" json:"queue_number"`
	RestaurantID    uint64     `gorm:"not null;index:idx_restaurant_status" json:"restaurant_id"`
	TableTypeID     uint64     `gorm:"not null;index:idx_table_type_status" json:"table_type_id"`
	QueuePrefix     string     `gorm:"size:10;not null" json:"queue_prefix"`
	UserID          uint64     `gorm:"not null;index" json:"user_id"`
	UserPhone       string     `gorm:"size:20;not null" json:"user_phone"`
	PeopleCount     int        `gorm:"not null;default:1" json:"people_count"`
	Status          int8       `gorm:"not null;default:0;index:idx_restaurant_status;index:idx_table_type_status" json:"status"`
	Position        int        `gorm:"default:0" json:"position"`
	EstimatedWaitTime int      `gorm:"default:0" json:"estimated_wait_time"`
	IsReservation   int8       `gorm:"default:0" json:"is_reservation"`
	ReservationID   *uint64    `json:"reservation_id"`
	OverNumberCount int        `gorm:"default:0" json:"over_number_count"`
	CalledAt        *time.Time `json:"called_at"`
	SeatedAt        *time.Time `json:"seated_at"`
	CompletedAt     *time.Time `json:"completed_at"`
	Remark          string     `gorm:"size:255" json:"remark"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type Reservation struct {
	ID          uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	ReserveNo   string     `gorm:"size:32;not null;unique;index" json:"reserve_no"`
	RestaurantID uint64    `gorm:"not null;index:idx_restaurant_date" json:"restaurant_id"`
	TableTypeID uint64     `gorm:"not null" json:"table_type_id"`
	UserID      uint64     `gorm:"not null;index" json:"user_id"`
	UserPhone   string     `gorm:"size:20;not null" json:"user_phone"`
	PeopleCount int        `gorm:"not null;default:1" json:"people_count"`
	ReserveDate string     `gorm:"type:date;not null;index:idx_restaurant_date;index:idx_reserve_datetime" json:"reserve_date"`
	ReserveTime string     `gorm:"type:time;not null;index:idx_reserve_datetime" json:"reserve_time"`
	Status      int8       `gorm:"not null;default:0" json:"status"`
	QueueID     *uint64    `json:"queue_id"`
	VerifyCode  string     `gorm:"size:20" json:"verify_code"`
	VerifiedAt  *time.Time `json:"verified_at"`
	Remark      string     `gorm:"size:255" json:"remark"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type VerifyRecord struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	RestaurantID  uint64    `gorm:"not null" json:"restaurant_id"`
	ReservationID uint64    `gorm:"not null;index" json:"reservation_id"`
	QueueID       *uint64   `json:"queue_id"`
	UserID        uint64    `gorm:"not null" json:"user_id"`
	VerifyCode    string    `gorm:"size:20;not null;index" json:"verify_code"`
	VerifyType    int8      `gorm:"not null;default:1" json:"verify_type"`
	VerifyResult  int8      `gorm:"not null;default:0" json:"verify_result"`
	OperatorID    *uint64   `json:"operator_id"`
	Remark        string    `gorm:"size:255" json:"remark"`
	CreatedAt     time.Time `json:"created_at"`
}

const (
	QueueStatusWaiting    = 0
	QueueStatusCalling    = 1
	QueueStatusSeated     = 2
	QueueStatusOver       = 3
	QueueStatusCancelled  = 4
	QueueStatusCompleted  = 5

	ReservationStatusPending   = 0
	ReservationStatusConfirmed = 1
	ReservationStatusCancelled = 2
	ReservationStatusExpired   = 3
	ReservationStatusCompleted = 4

	VerifyTypeReservation = 1
	VerifyTypeQueue       = 2

	VerifyResultFailed  = 0
	VerifyResultSuccess = 1
)
