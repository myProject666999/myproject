package models

import (
	"time"
)

type Order struct {
	ID              uint64         `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	OrderNo         string         `gorm:"column:order_no;size:32;uniqueIndex;not null" json:"order_no"`
	UserID          uint64         `gorm:"column:user_id;not null;index" json:"user_id"`
	TotalAmount     float64        `gorm:"column:total_amount;type:decimal(12,2);not null" json:"total_amount"`
	DeliveryFee     float64        `gorm:"column:delivery_fee;type:decimal(10,2);default:0" json:"delivery_fee"`
	DiscountAmount  float64        `gorm:"column:discount_amount;type:decimal(10,2);default:0" json:"discount_amount"`
	PayableAmount   float64        `gorm:"column:payable_amount;type:decimal(12,2);not null" json:"payable_amount"`
	DeliveryAddress string         `gorm:"column:delivery_address;size:500;not null" json:"delivery_address"`
	DeliverySlotID  uint64         `gorm:"column:delivery_slot_id;not null;index" json:"delivery_slot_id"`
	ContactName     string         `gorm:"column:contact_name;size:50;not null" json:"contact_name"`
	ContactPhone    string         `gorm:"column:contact_phone;size:20;not null" json:"contact_phone"`
	Remark          string         `gorm:"column:remark;size:500" json:"remark"`
	Status          string         `gorm:"column:status;type:enum('pending','paid','preparing','delivering','completed','cancelled','refunded');default:pending" json:"status"`
	PaymentStatus   string         `gorm:"column:payment_status;type:enum('unpaid','paid','refunded');default:unpaid" json:"payment_status"`
	DeliveryStatus  string         `gorm:"column:delivery_status;type:enum('pending','picked_up','delivering','delivered','failed');default:pending" json:"delivery_status"`
	CreatedAt       time.Time      `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	PaidAt          *time.Time     `gorm:"column:paid_at" json:"paid_at"`
	DeliveredAt     *time.Time     `gorm:"column:delivered_at" json:"delivered_at"`
	Items           []OrderItem    `gorm:"foreignKey:OrderID" json:"items,omitempty"`
	User            *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	DeliverySlot    *DeliverySlot  `gorm:"foreignKey:DeliverySlotID" json:"delivery_slot,omitempty"`
}

func (Order) TableName() string {
	return "orders"
}

type OrderItem struct {
	ID            uint64    `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	OrderID       uint64    `gorm:"column:order_id;not null;index" json:"order_id"`
	ProductID     uint64    `gorm:"column:product_id;not null;index" json:"product_id"`
	ProductName   string    `gorm:"column:product_name;size:100;not null" json:"product_name"`
	ProductImage  string    `gorm:"column:product_image;size:500" json:"product_image"`
	PriceUnit     string    `gorm:"column:price_unit;type:enum('weight','piece');not null" json:"price_unit"`
	UnitPrice     float64   `gorm:"column:unit_price;type:decimal(10,2);not null" json:"unit_price"`
	Quantity      float64   `gorm:"column:quantity;type:decimal(10,2);not null" json:"quantity"`
	Subtotal      float64   `gorm:"column:subtotal;type:decimal(12,2);not null" json:"subtotal"`
	CreatedAt     time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
}

func (OrderItem) TableName() string {
	return "order_items"
}

type OrderCreateRequest struct {
	CartItemIDs    []uint64 `json:"cart_item_ids" validate:"required"`
	DeliverySlotID uint64   `json:"delivery_slot_id" validate:"required"`
	DeliveryAddress string  `json:"delivery_address" validate:"required"`
	ContactName    string   `json:"contact_name" validate:"required"`
	ContactPhone   string   `json:"contact_phone" validate:"required"`
	Remark         string   `json:"remark"`
}

type OrderListQuery struct {
	Status string `query:"status"`
	Page   int    `query:"page"`
	PageSize int  `query:"page_size"`
}

type OrderStatusUpdateRequest struct {
	Status string `json:"status" validate:"required,oneof=pending paid preparing delivering completed cancelled refunded"`
}

type DeliveryRecord struct {
	ID          uint64    `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	OrderID     uint64    `gorm:"column:order_id;not null;index" json:"order_id"`
	Action      string    `gorm:"column:action;type:enum('assigned','picked_up','en_route','delivered','failed');not null" json:"action"`
	Description string    `gorm:"column:description;size:500" json:"description"`
	Operator    string    `gorm:"column:operator;size:50" json:"operator"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
}

func (DeliveryRecord) TableName() string {
	return "delivery_records"
}

type DeliveryActionRequest struct {
	Action      string `json:"action" validate:"required,oneof=assigned picked_up en_route delivered failed"`
	Description string `json:"description"`
}
