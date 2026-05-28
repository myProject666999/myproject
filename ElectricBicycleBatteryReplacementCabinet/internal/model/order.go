package model

import (
	"time"
)

const (
	PayTypeWallet  = 1
	PayTypePackage = 2
)

const (
	PayStatusPending = 1
	PayStatusPaid    = 2
	PayStatusRefund  = 3
)

const (
	OrderStatusProcessing = 1
	OrderStatusCompleted  = 2
	OrderStatusCancelled  = 3
)

type Order struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderNo       string    `gorm:"size:64;uniqueIndex" json:"order_no"`
	UserID        uint64    `gorm:"index" json:"user_id"`
	CabinetID     uint64    `gorm:"index" json:"cabinet_id"`
	OutBatteryID  uint64    `json:"out_battery_id"`
	InBatteryID   uint64    `json:"in_battery_id"`
	OutSlotID     uint64    `json:"out_slot_id"`
	InSlotID      uint64    `json:"in_slot_id"`
	PackageID     *uint64   `json:"package_id"`
	Amount        float64   `gorm:"type:decimal(10,2)" json:"amount"`
	DiscountAmount float64  `gorm:"type:decimal(10,2)" json:"discount_amount"`
	PayAmount     float64   `gorm:"type:decimal(10,2)" json:"pay_amount"`
	PayType       *int      `json:"pay_type"`
	PayStatus     int       `gorm:"index:idx_status" json:"pay_status"`
	OrderStatus   int       `gorm:"index:idx_status" json:"order_status"`
	OutBatterySOC *int      `gorm:"type:tinyint unsigned" json:"out_battery_soc"`
	InBatterySOC  *int      `gorm:"type:tinyint unsigned" json:"in_battery_soc"`
	StartTime     *time.Time `json:"start_time"`
	FinishTime    *time.Time `json:"finish_time"`
	IdempotentKey string    `gorm:"size:128;uniqueIndex" json:"idempotent_key"`
	Remark        *string   `gorm:"size:256" json:"remark"`
	CreatedAt     time.Time `gorm:"index" json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (Order) TableName() string {
	return "order"
}

type OrderListReq struct {
	Page        int       `form:"page,default=1"`
	PageSize    int       `form:"page_size,default=10"`
	OrderNo     string    `form:"order_no"`
	UserID      *uint64   `form:"user_id"`
	CabinetID   *uint64   `form:"cabinet_id"`
	OrderStatus *int      `form:"order_status"`
	PayStatus   *int      `form:"pay_status"`
	StartTime   *time.Time `form:"start_time"`
	EndTime     *time.Time `form:"end_time"`
}

type OrderDetailVO struct {
	Order
	UserName      string  `json:"user_name"`
	UserPhone     string  `json:"user_phone"`
	CabinetName   string  `json:"cabinet_name"`
	CabinetNo     string  `json:"cabinet_no"`
	OutBatteryNo  string  `json:"out_battery_no"`
	InBatteryNo   string  `json:"in_battery_no"`
	PackageName   string  `json:"package_name"`
}

type OrderStatsVO struct {
	TotalOrders     int64   `json:"total_orders"`
	TodayOrders     int64   `json:"today_orders"`
	TotalAmount     float64 `json:"total_amount"`
	TodayAmount     float64 `json:"today_amount"`
	CompletedOrders int64   `json:"completed_orders"`
}
