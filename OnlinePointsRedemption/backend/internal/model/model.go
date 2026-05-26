package model

import "time"

type User struct {
	ID        uint64    `json:"id" gorm:"primaryKey;column:id"`
	Username  string    `json:"username" gorm:"column:username;uniqueIndex"`
	Nickname  string    `json:"nickname" gorm:"column:nickname"`
	Avatar    string    `json:"avatar" gorm:"column:avatar"`
	Mobile    string    `json:"mobile" gorm:"column:mobile"`
	Email     string    `json:"email" gorm:"column:email"`
	Status    int8      `json:"status" gorm:"column:status"`
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:updated_at"`
}

func (User) TableName() string {
	return "users"
}

type PointsAccount struct {
	ID               uint64    `json:"id" gorm:"primaryKey;column:id"`
	UserID           uint64    `json:"user_id" gorm:"column:user_id;uniqueIndex"`
	TotalPoints      int32     `json:"total_points" gorm:"column:total_points"`
	AvailablePoints  int32     `json:"available_points" gorm:"column:available_points"`
	FrozenPoints     int32     `json:"frozen_points" gorm:"column:frozen_points"`
	Version          int32     `json:"version" gorm:"column:version"`
	CreatedAt        time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt        time.Time `json:"updated_at" gorm:"column:updated_at"`
}

func (PointsAccount) TableName() string {
	return "points_account"
}

type PointsRule struct {
	ID          uint64    `json:"id" gorm:"primaryKey;column:id"`
	RuleCode    string    `json:"rule_code" gorm:"column:rule_code;uniqueIndex"`
	RuleName    string    `json:"rule_name" gorm:"column:rule_name"`
	Description string    `json:"description" gorm:"column:description"`
	Points      int32     `json:"points" gorm:"column:points"`
	RuleType    int8      `json:"rule_type" gorm:"column:rule_type"`
	DailyLimit  int32     `json:"daily_limit" gorm:"column:daily_limit"`
	Status      int8      `json:"status" gorm:"column:status"`
	CreatedAt   time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"column:updated_at"`
}

func (PointsRule) TableName() string {
	return "points_rules"
}

type PointsDetail struct {
	ID            uint64    `json:"id" gorm:"primaryKey;column:id"`
	UserID        uint64    `json:"user_id" gorm:"column:user_id;index:idx_user_created"`
	RuleCode      string    `json:"rule_code" gorm:"column:rule_code"`
	ChangePoints  int32     `json:"change_points" gorm:"column:change_points"`
	BalanceBefore int32     `json:"balance_before" gorm:"column:balance_before"`
	BalanceAfter  int32     `json:"balance_after" gorm:"column:balance_after"`
	OrderNo       string    `json:"order_no" gorm:"column:order_no"`
	Remark        string    `json:"remark" gorm:"column:remark"`
	CreatedAt     time.Time `json:"created_at" gorm:"column:created_at;index:idx_user_created"`
}

func (PointsDetail) TableName() string {
	return "points_detail"
}

type Product struct {
	ID            uint64    `json:"id" gorm:"primaryKey;column:id"`
	ProductCode   string    `json:"product_code" gorm:"column:product_code;uniqueIndex"`
	ProductName   string    `json:"product_name" gorm:"column:product_name"`
	Description   string    `json:"description" gorm:"column:description"`
	ImageURL      string    `json:"image_url" gorm:"column:image_url"`
	CategoryID    uint64    `json:"category_id" gorm:"column:category_id"`
	PointsPrice   int32     `json:"points_price" gorm:"column:points_price"`
	OriginalPrice float64   `json:"original_price" gorm:"column:original_price"`
	Status        int8      `json:"status" gorm:"column:status"`
	SortOrder     int32     `json:"sort_order" gorm:"column:sort_order"`
	CreatedAt     time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt     time.Time `json:"updated_at" gorm:"column:updated_at"`
}

func (Product) TableName() string {
	return "products"
}

type ProductStock struct {
	ID             uint64    `json:"id" gorm:"primaryKey;column:id"`
	ProductID      uint64    `json:"product_id" gorm:"column:product_id;uniqueIndex"`
	TotalStock     int32     `json:"total_stock" gorm:"column:total_stock"`
	AvailableStock int32     `json:"available_stock" gorm:"column:available_stock"`
	FrozenStock    int32     `json:"frozen_stock" gorm:"column:frozen_stock"`
	Version        int32     `json:"version" gorm:"column:version"`
	CreatedAt      time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"column:updated_at"`
}

func (ProductStock) TableName() string {
	return "product_stock"
}

type RedemptionOrder struct {
	ID               uint64     `json:"id" gorm:"primaryKey;column:id"`
	OrderNo          string     `json:"order_no" gorm:"column:order_no;uniqueIndex"`
	UserID           uint64     `json:"user_id" gorm:"column:user_id;index"`
	ProductID        uint64     `json:"product_id" gorm:"column:product_id"`
	ProductName      string     `json:"product_name" gorm:"column:product_name"`
	ProductImage     string     `json:"product_image" gorm:"column:product_image"`
	PointsPrice      int32      `json:"points_price" gorm:"column:points_price"`
	Quantity         int32      `json:"quantity" gorm:"column:quantity"`
	TotalPoints      int32      `json:"total_points" gorm:"column:total_points"`
	Status           int8       `json:"status" gorm:"column:status;index"`
	ConsigneeName    string     `json:"consignee_name" gorm:"column:consignee_name"`
	ConsigneePhone   string     `json:"consignee_phone" gorm:"column:consignee_phone"`
	ConsigneeAddress string     `json:"consignee_address" gorm:"column:consignee_address"`
	ExpressNo        string     `json:"express_no" gorm:"column:express_no"`
	ExpressCompany   string     `json:"express_company" gorm:"column:express_company"`
	CancelReason     string     `json:"cancel_reason" gorm:"column:cancel_reason"`
	CreatedAt        time.Time  `json:"created_at" gorm:"column:created_at;index"`
	UpdatedAt        time.Time  `json:"updated_at" gorm:"column:updated_at"`
	ShippedAt        *time.Time `json:"shipped_at" gorm:"column:shipped_at"`
	CompletedAt      *time.Time `json:"completed_at" gorm:"column:completed_at"`
	CancelledAt      *time.Time `json:"cancelled_at" gorm:"column:cancelled_at"`
}

func (RedemptionOrder) TableName() string {
	return "redemption_orders"
}

type ProductCategory struct {
	ID           uint64    `json:"id" gorm:"primaryKey;column:id"`
	ParentID     uint64    `json:"parent_id" gorm:"column:parent_id"`
	CategoryName string    `json:"category_name" gorm:"column:category_name"`
	Icon         string    `json:"icon" gorm:"column:icon"`
	SortOrder    int32     `json:"sort_order" gorm:"column:sort_order"`
	Status       int8      `json:"status" gorm:"column:status"`
	CreatedAt    time.Time `json:"created_at" gorm:"column:created_at"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"column:updated_at"`
}

func (ProductCategory) TableName() string {
	return "product_categories"
}
