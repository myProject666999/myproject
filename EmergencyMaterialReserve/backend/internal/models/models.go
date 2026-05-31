package models

import (
	"time"
)

type User struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Username  string    `gorm:"size:50;uniqueIndex;not null" json:"username"`
	Password  string    `gorm:"size:255;not null" json:"-"`
	RealName  string    `gorm:"size:50;not null" json:"real_name"`
	Phone     string    `gorm:"size:20" json:"phone"`
	Email     string    `gorm:"size:100" json:"email"`
	Role      string    `gorm:"type:enum('admin','manager','operator','viewer');default:'viewer'" json:"role"`
	Status    int8      `gorm:"default:1" json:"status"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

type Warehouse struct {
	ID           uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Code         string     `gorm:"size:50;uniqueIndex;not null" json:"code"`
	Name         string     `gorm:"size:100;not null" json:"name"`
	Province     string     `gorm:"size:50" json:"province"`
	City         string     `gorm:"size:50" json:"city"`
	District     string     `gorm:"size:50" json:"district"`
	Address      string     `gorm:"size:255" json:"address"`
	Longitude    *float64   `gorm:"type:decimal(10,6)" json:"longitude"`
	Latitude     *float64   `gorm:"type:decimal(10,6)" json:"latitude"`
	ManagerID    *uint64    `json:"manager_id"`
	Capacity     *float64   `gorm:"type:decimal(15,2)" json:"capacity"`
	UsedCapacity *float64   `gorm:"type:decimal(15,2);default:0" json:"used_capacity"`
	Status       int8       `gorm:"default:1" json:"status"`
	Remark       *string    `gorm:"type:text" json:"remark"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	Manager      *User      `gorm:"foreignKey:ManagerID" json:"manager,omitempty"`
}

type MaterialCategory struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Code      string    `gorm:"size:50;uniqueIndex;not null" json:"code"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	ParentID  uint64    `gorm:"default:0" json:"parent_id"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	Status    int8      `gorm:"default:1" json:"status"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

type Material struct {
	ID             uint64           `gorm:"primaryKey;autoIncrement" json:"id"`
	Code           string           `gorm:"size:50;uniqueIndex;not null" json:"code"`
	Name           string           `gorm:"size:100;not null" json:"name"`
	CategoryID     *uint64          `json:"category_id"`
	Specification  string           `gorm:"size:200" json:"specification"`
	Unit           string           `gorm:"size:20;not null" json:"unit"`
	WarningStock   int              `gorm:"default:0" json:"warning_stock"`
	EmergencyLevel string           `gorm:"type:enum('high','medium','low');default:'medium'" json:"emergency_level"`
	Description    *string          `gorm:"type:text" json:"description"`
	Status         int8             `gorm:"default:1" json:"status"`
	CreatedAt      time.Time        `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time        `gorm:"autoUpdateTime" json:"updated_at"`
	Category       *MaterialCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

type Inventory struct {
	ID                uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	WarehouseID       uint64    `gorm:"not null;uniqueIndex:idx_warehouse_material_batch" json:"warehouse_id"`
	MaterialID        uint64    `gorm:"not null;uniqueIndex:idx_warehouse_material_batch" json:"material_id"`
	BatchNo           string    `gorm:"size:100;not null;uniqueIndex:idx_warehouse_material_batch" json:"batch_no"`
	Quantity          int       `gorm:"not null;default:0" json:"quantity"`
	LockedQuantity    int       `gorm:"not null;default:0" json:"locked_quantity"`
	AvailableQuantity int       `gorm:"not null;default:0" json:"available_quantity"`
	UnitPrice         *float64  `gorm:"type:decimal(15,2)" json:"unit_price"`
	ProductionDate    *time.Time `gorm:"type:date" json:"production_date"`
	ExpiryDate        *time.Time `gorm:"type:date" json:"expiry_date"`
	ExpiryWarningLevel string   `gorm:"type:enum('none','yellow','orange','red');default:'none'" json:"expiry_warning_level"`
	Status            int8      `gorm:"default:1" json:"status"`
	CreatedAt         time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	Warehouse         *Warehouse `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	Material          *Material  `gorm:"foreignKey:MaterialID" json:"material,omitempty"`
}

type InventorySummary struct {
	ID                uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	WarehouseID       uint64    `gorm:"not null;uniqueIndex:idx_warehouse_material" json:"warehouse_id"`
	MaterialID        uint64    `gorm:"not null;uniqueIndex:idx_warehouse_material" json:"material_id"`
	TotalQuantity     int       `gorm:"not null;default:0" json:"total_quantity"`
	LockedQuantity    int       `gorm:"not null;default:0" json:"locked_quantity"`
	AvailableQuantity int       `gorm:"not null;default:0" json:"available_quantity"`
	WarningStock      int       `gorm:"default:0" json:"warning_stock"`
	IsBelowWarning    int8      `gorm:"default:0" json:"is_below_warning"`
	UpdatedAt         time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	Warehouse         *Warehouse `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	Material          *Material  `gorm:"foreignKey:MaterialID" json:"material,omitempty"`
}

type ExpiryAlert struct {
	ID            uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	InventoryID   uint64     `gorm:"not null" json:"inventory_id"`
	WarehouseID   uint64     `gorm:"not null" json:"warehouse_id"`
	MaterialID    uint64     `gorm:"not null" json:"material_id"`
	BatchNo       string     `gorm:"size:100;not null" json:"batch_no"`
	ExpiryDate    *time.Time  `gorm:"type:date" json:"expiry_date"`
	RemainingDays *int       `json:"remaining_days"`
	AlertLevel    string     `gorm:"type:enum('yellow','orange','red');not null" json:"alert_level"`
	Quantity      int        `gorm:"not null" json:"quantity"`
	Status        int8       `gorm:"default:0" json:"status"`
	HandledBy     *uint64    `json:"handled_by"`
	HandledAt     *time.Time  `json:"handled_at"`
	HandleRemark  *string    `gorm:"type:text" json:"handle_remark"`
	CreatedAt     time.Time  `gorm:"autoCreateTime" json:"created_at"`
	Inventory     *Inventory `gorm:"foreignKey:InventoryID" json:"inventory,omitempty"`
	Warehouse     *Warehouse `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	Material      *Material  `gorm:"foreignKey:MaterialID" json:"material,omitempty"`
	Handler       *User      `gorm:"foreignKey:HandledBy" json:"handler,omitempty"`
}

type TransferOrder struct {
	ID                 uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderNo            string    `gorm:"size:50;uniqueIndex;not null" json:"order_no"`
	Title              string    `gorm:"size:200;not null" json:"title"`
	Type               string    `gorm:"type:enum('emergency','normal');default:'normal'" json:"type"`
	Priority           string    `gorm:"type:enum('high','medium','low');default:'medium'" json:"priority"`
	FromWarehouseID    uint64    `gorm:"not null" json:"from_warehouse_id"`
	ToWarehouseID      uint64    `gorm:"not null" json:"to_warehouse_id"`
	Status             string    `gorm:"type:enum('draft','pending_approval','approved','rejected','in_transit','received','completed','cancelled');default:'draft'" json:"status"`
	ApplicantID        *uint64   `json:"applicant_id"`
	ApplyTime          *time.Time `json:"apply_time"`
	ApproverID         *uint64   `json:"approver_id"`
	ApproveTime        *time.Time `json:"approve_time"`
	ApproveRemark      *string   `gorm:"type:text" json:"approve_remark"`
	SenderID           *uint64   `json:"sender_id"`
	SendTime           *time.Time `json:"send_time"`
	ReceiverID         *uint64   `json:"receiver_id"`
	ReceiveTime        *time.Time `json:"receive_time"`
	TotalQuantity      int       `gorm:"default:0" json:"total_quantity"`
	EstimatedArrivalDate *time.Time `gorm:"type:date" json:"estimated_arrival_date"`
	TransportInfo      *string   `gorm:"type:text" json:"transport_info"`
	Remark             *string   `gorm:"type:text" json:"remark"`
	CreatedAt          time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt          time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	FromWarehouse      *Warehouse `gorm:"foreignKey:FromWarehouseID" json:"from_warehouse,omitempty"`
	ToWarehouse        *Warehouse `gorm:"foreignKey:ToWarehouseID" json:"to_warehouse,omitempty"`
	Applicant          *User      `gorm:"foreignKey:ApplicantID" json:"applicant,omitempty"`
	Approver           *User      `gorm:"foreignKey:ApproverID" json:"approver,omitempty"`
	Sender             *User      `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
	Receiver           *User      `gorm:"foreignKey:ReceiverID" json:"receiver,omitempty"`
	Items              []TransferOrderItem `gorm:"foreignKey:OrderID" json:"items,omitempty"`
}

type TransferOrderItem struct {
	ID               uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID          uint64         `gorm:"not null" json:"order_id"`
	MaterialID       uint64         `gorm:"not null" json:"material_id"`
	FromInventoryID  *uint64        `json:"from_inventory_id"`
	BatchNo          string         `gorm:"size:100" json:"batch_no"`
	ApplyQuantity    int            `gorm:"not null" json:"apply_quantity"`
	ApprovedQuantity *int           `json:"approved_quantity"`
	ActualQuantity   *int           `json:"actual_quantity"`
	ReceivedQuantity *int           `json:"received_quantity"`
	UnitPrice        *float64       `gorm:"type:decimal(15,2)" json:"unit_price"`
	Remark           *string        `gorm:"type:text" json:"remark"`
	CreatedAt        time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	Material         *Material      `gorm:"foreignKey:MaterialID" json:"material,omitempty"`
	FromInventory    *Inventory     `gorm:"foreignKey:FromInventoryID" json:"from_inventory,omitempty"`
}

type StockRecord struct {
	ID              uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	RecordNo        string    `gorm:"size:50;uniqueIndex;not null" json:"record_no"`
	Type            string    `gorm:"type:enum('in','out');not null" json:"type"`
	BizType         string    `gorm:"type:enum('purchase','transfer_in','transfer_out','allocation','return','adjustment','scrap');not null" json:"biz_type"`
	WarehouseID     uint64    `gorm:"not null" json:"warehouse_id"`
	MaterialID      uint64    `gorm:"not null" json:"material_id"`
	InventoryID     *uint64   `json:"inventory_id"`
	BatchNo         string    `gorm:"size:100" json:"batch_no"`
	Quantity        int       `gorm:"not null" json:"quantity"`
	BeforeQuantity  *int      `json:"before_quantity"`
	AfterQuantity   *int      `json:"after_quantity"`
	UnitPrice       *float64  `gorm:"type:decimal(15,2)" json:"unit_price"`
	RelatedOrderID  *uint64   `json:"related_order_id"`
	RelatedOrderNo  string    `gorm:"size:50" json:"related_order_no"`
	OperatorID      *uint64   `json:"operator_id"`
	OperationTime   time.Time `gorm:"not null;autoCreateTime" json:"operation_time"`
	Remark          *string   `gorm:"type:text" json:"remark"`
	IdempotentKey   string    `gorm:"size:100;uniqueIndex;not null" json:"idempotent_key"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
	Warehouse       *Warehouse `gorm:"foreignKey:WarehouseID" json:"warehouse,omitempty"`
	Material        *Material  `gorm:"foreignKey:MaterialID" json:"material,omitempty"`
	Inventory       *Inventory `gorm:"foreignKey:InventoryID" json:"inventory,omitempty"`
	Operator        *User      `gorm:"foreignKey:OperatorID" json:"operator,omitempty"`
}

type DemandRequest struct {
	ID              uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	RequestNo       string    `gorm:"size:50;uniqueIndex;not null" json:"request_no"`
	Title           string    `gorm:"size:200;not null" json:"title"`
	Department      string    `gorm:"size:100" json:"department"`
	ApplicantID     *uint64   `json:"applicant_id"`
	EmergencyLevel  string    `gorm:"type:enum('high','medium','low');default:'medium'" json:"emergency_level"`
	Reason          *string   `gorm:"type:text" json:"reason"`
	Status          string    `gorm:"type:enum('draft','pending_approval','approved','rejected','processing','completed','cancelled');default:'draft'" json:"status"`
	ApproverID      *uint64   `json:"approver_id"`
	ApproveTime     *time.Time `json:"approve_time"`
	ApproveRemark   *string   `gorm:"type:text" json:"approve_remark"`
	TotalQuantity   int       `gorm:"default:0" json:"total_quantity"`
	DemandDate      *time.Time `gorm:"type:date" json:"demand_date"`
	Remark          *string   `gorm:"type:text" json:"remark"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	Applicant       *User     `gorm:"foreignKey:ApplicantID" json:"applicant,omitempty"`
	Approver        *User     `gorm:"foreignKey:ApproverID" json:"approver,omitempty"`
	Items           []DemandRequestItem `gorm:"foreignKey:RequestID" json:"items,omitempty"`
}

type DemandRequestItem struct {
	ID               uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	RequestID        uint64    `gorm:"not null" json:"request_id"`
	MaterialID       uint64    `gorm:"not null" json:"material_id"`
	DemandQuantity   int       `gorm:"not null" json:"demand_quantity"`
	ApprovedQuantity *int      `json:"approved_quantity"`
	AllocatedQuantity int      `gorm:"default:0" json:"allocated_quantity"`
	Remark           *string   `gorm:"type:text" json:"remark"`
	CreatedAt        time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	Material         *Material `gorm:"foreignKey:MaterialID" json:"material,omitempty"`
}

type OperationLog struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    *uint64   `json:"user_id"`
	Username  string    `gorm:"size:50" json:"username"`
	Module    string    `gorm:"size:50;not null" json:"module"`
	Operation string    `gorm:"size:50;not null" json:"operation"`
	Method    string    `gorm:"size:20" json:"method"`
	Path      string    `gorm:"size:200" json:"path"`
	IP        string    `gorm:"size:50" json:"ip"`
	Params    *string   `gorm:"type:text" json:"params"`
	Result    *string   `gorm:"type:text" json:"result"`
	BizID     *uint64   `json:"biz_id"`
	BizNo     string    `gorm:"size:50" json:"biz_no"`
	Status    int8      `gorm:"default:1" json:"status"`
	ErrorMsg  *string   `gorm:"type:text" json:"error_msg"`
	Duration  *int      `json:"duration"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type SystemConfig struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	ConfigKey   string    `gorm:"size:100;uniqueIndex;not null" json:"config_key"`
	ConfigValue *string   `gorm:"type:text" json:"config_value"`
	ConfigDesc  string    `gorm:"size:200" json:"config_desc"`
	ConfigGroup string    `gorm:"size:50;default:'default'" json:"config_group"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (User) TableName() string              { return "users" }
func (Warehouse) TableName() string         { return "warehouses" }
func (MaterialCategory) TableName() string  { return "material_categories" }
func (Material) TableName() string          { return "materials" }
func (Inventory) TableName() string         { return "inventory" }
func (InventorySummary) TableName() string  { return "inventory_summary" }
func (ExpiryAlert) TableName() string       { return "expiry_alerts" }
func (TransferOrder) TableName() string     { return "transfer_orders" }
func (TransferOrderItem) TableName() string { return "transfer_order_items" }
func (StockRecord) TableName() string       { return "stock_records" }
func (DemandRequest) TableName() string     { return "demand_requests" }
func (DemandRequestItem) TableName() string { return "demand_request_items" }
func (OperationLog) TableName() string      { return "operation_logs" }
func (SystemConfig) TableName() string      { return "system_configs" }
