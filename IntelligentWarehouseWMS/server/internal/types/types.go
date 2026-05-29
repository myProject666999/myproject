package types

type LoginReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResp struct {
	Token    string `json:"token"`
	UserId   int64  `json:"userId"`
	Username string `json:"username"`
	RealName string `json:"realName"`
	Role     string `json:"role"`
}

type UserInfo struct {
	Id         int64  `json:"id"`
	Username   string `json:"username"`
	RealName   string `json:"realName"`
	Phone      string `json:"phone"`
	Email      string `json:"email"`
	Role       string `json:"role"`
	Status     int64  `json:"status"`
	Remark     string `json:"remark"`
	CreateTime string `json:"createTime"`
}

type UserListReq struct {
	Page     int64  `form:"page"`
	PageSize int64  `form:"pageSize"`
	Username string `form:"username,optional"`
	RealName string `form:"realName,optional"`
	Phone    string `form:"phone,optional"`
	Role     string `form:"role,optional"`
	Status   int64  `form:"status,optional"`
}

type UserListResp struct {
	Total int64      `json:"total"`
	List  []UserInfo `json:"list"`
}

type UserCreateReq struct {
	Username string `json:"username"`
	Password string `json:"password"`
	RealName string `json:"realName"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Status   int64  `json:"status"`
	Remark   string `json:"remark"`
}

type UserUpdateReq struct {
	Id       int64  `json:"id"`
	Username string `json:"username"`
	Password string `json:"password,optional"`
	RealName string `json:"realName"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Status   int64  `json:"status"`
	Remark   string `json:"remark"`
}

type UserDeleteReq struct {
	Id int64 `json:"id"`
}

type CommonResp struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type WarehouseInfo struct {
	Id            int64  `json:"id"`
	WarehouseCode string `json:"warehouseCode"`
	WarehouseName string `json:"warehouseName"`
	Address       string `json:"address"`
	Manager       string `json:"manager"`
	Phone         string `json:"phone"`
	Status        int64  `json:"status"`
	Remark        string `json:"remark"`
	CreateTime    string `json:"createTime"`
}

type WarehouseListReq struct {
	Page          int64  `form:"page"`
	PageSize      int64  `form:"pageSize"`
	WarehouseCode string `form:"warehouseCode,optional"`
	WarehouseName string `form:"warehouseName,optional"`
	Status        int64  `form:"status,optional"`
}

type WarehouseListResp struct {
	Total int64           `json:"total"`
	List  []WarehouseInfo `json:"list"`
}

type WarehouseCreateReq struct {
	WarehouseCode string `json:"warehouseCode"`
	WarehouseName string `json:"warehouseName"`
	Address       string `json:"address"`
	Manager       string `json:"manager"`
	Phone         string `json:"phone"`
	Status        int64  `json:"status"`
	Remark        string `json:"remark"`
}

type WarehouseUpdateReq struct {
	Id            int64  `json:"id"`
	WarehouseCode string `json:"warehouseCode"`
	WarehouseName string `json:"warehouseName"`
	Address       string `json:"address"`
	Manager       string `json:"manager"`
	Phone         string `json:"phone"`
	Status        int64  `json:"status"`
	Remark        string `json:"remark"`
}

type WarehouseDeleteReq struct {
	Id int64 `json:"id"`
}

type ShelfInfo struct {
	Id          int64  `json:"id"`
	WarehouseId int64  `json:"warehouseId"`
	ShelfCode   string `json:"shelfCode"`
	ShelfName   string `json:"shelfName"`
	Rows        int    `json:"rows"`
	Columns     int    `json:"columns"`
	Status      int64  `json:"status"`
	Remark      string `json:"remark"`
	CreateTime  string `json:"createTime"`
}

type ShelfListReq struct {
	Page        int64  `form:"page"`
	PageSize    int64  `form:"pageSize"`
	WarehouseId int64  `form:"warehouseId,optional"`
	ShelfCode   string `form:"shelfCode,optional"`
	ShelfName   string `form:"shelfName,optional"`
	Status      int64  `form:"status,optional"`
}

type ShelfListResp struct {
	Total int64       `json:"total"`
	List  []ShelfInfo `json:"list"`
}

type ShelfCreateReq struct {
	WarehouseId int64  `json:"warehouseId"`
	ShelfCode   string `json:"shelfCode"`
	ShelfName   string `json:"shelfName"`
	Rows        int    `json:"rows"`
	Columns     int    `json:"columns"`
	Status      int64  `json:"status"`
	Remark      string `json:"remark"`
}

type ShelfUpdateReq struct {
	Id          int64  `json:"id"`
	WarehouseId int64  `json:"warehouseId"`
	ShelfCode   string `json:"shelfCode"`
	ShelfName   string `json:"shelfName"`
	Rows        int    `json:"rows"`
	Columns     int    `json:"columns"`
	Status      int64  `json:"status"`
	Remark      string `json:"remark"`
}

type ShelfDeleteReq struct {
	Id int64 `json:"id"`
}

type LocationInfo struct {
	Id           int64   `json:"id"`
	WarehouseId  int64   `json:"warehouseId"`
	ShelfId      int64   `json:"shelfId"`
	LocationCode string  `json:"locationCode"`
	RowNo        int     `json:"rowNo"`
	ColNo        int     `json:"colNo"`
	Capacity     float64 `json:"capacity"`
	UsedCapacity float64 `json:"usedCapacity"`
	Status       int64   `json:"status"`
	Remark       string  `json:"remark"`
	CreateTime   string  `json:"createTime"`
}

type LocationListReq struct {
	Page         int64  `form:"page"`
	PageSize     int64  `form:"pageSize"`
	WarehouseId  int64  `form:"warehouseId,optional"`
	ShelfId      int64  `form:"shelfId,optional"`
	LocationCode string `form:"locationCode,optional"`
	Status       int64  `form:"status,optional"`
}

type LocationListResp struct {
	Total int64          `json:"total"`
	List  []LocationInfo `json:"list"`
}

type LocationCreateReq struct {
	WarehouseId  int64   `json:"warehouseId"`
	ShelfId      int64   `json:"shelfId"`
	LocationCode string  `json:"locationCode"`
	RowNo        int     `json:"rowNo"`
	ColNo        int     `json:"colNo"`
	Capacity     float64 `json:"capacity"`
	UsedCapacity float64 `json:"usedCapacity"`
	Status       int64   `json:"status"`
	Remark       string  `json:"remark"`
}

type LocationUpdateReq struct {
	Id           int64   `json:"id"`
	WarehouseId  int64   `json:"warehouseId"`
	ShelfId      int64   `json:"shelfId"`
	LocationCode string  `json:"locationCode"`
	RowNo        int     `json:"rowNo"`
	ColNo        int     `json:"colNo"`
	Capacity     float64 `json:"capacity"`
	UsedCapacity float64 `json:"usedCapacity"`
	Status       int64   `json:"status"`
	Remark       string  `json:"remark"`
}

type LocationDeleteReq struct {
	Id int64 `json:"id"`
}

type ProductInfo struct {
	Id          int64   `json:"id"`
	Sku         string  `json:"sku"`
	ProductName string  `json:"productName"`
	Category    string  `json:"category"`
	Spec        string  `json:"spec"`
	Unit        string  `json:"unit"`
	Weight      float64 `json:"weight"`
	Volume      float64 `json:"volume"`
	MinStock    int     `json:"minStock"`
	MaxStock    int     `json:"maxStock"`
	Status      int64   `json:"status"`
	Remark      string  `json:"remark"`
	CreateTime  string  `json:"createTime"`
}

type ProductListReq struct {
	Page        int64  `form:"page"`
	PageSize    int64  `form:"pageSize"`
	Sku         string `form:"sku,optional"`
	ProductName string `form:"productName,optional"`
	Category    string `form:"category,optional"`
	Status      int64  `form:"status,optional"`
}

type ProductListResp struct {
	Total int64         `json:"total"`
	List  []ProductInfo `json:"list"`
}

type ProductCreateReq struct {
	Sku         string  `json:"sku"`
	ProductName string  `json:"productName"`
	Category    string  `json:"category"`
	Spec        string  `json:"spec"`
	Unit        string  `json:"unit"`
	Weight      float64 `json:"weight"`
	Volume      float64 `json:"volume"`
	MinStock    int     `json:"minStock"`
	MaxStock    int     `json:"maxStock"`
	Status      int64   `json:"status"`
	Remark      string  `json:"remark"`
}

type ProductUpdateReq struct {
	Id          int64   `json:"id"`
	Sku         string  `json:"sku"`
	ProductName string  `json:"productName"`
	Category    string  `json:"category"`
	Spec        string  `json:"spec"`
	Unit        string  `json:"unit"`
	Weight      float64 `json:"weight"`
	Volume      float64 `json:"volume"`
	MinStock    int     `json:"minStock"`
	MaxStock    int     `json:"maxStock"`
	Status      int64   `json:"status"`
	Remark      string  `json:"remark"`
}

type ProductDeleteReq struct {
	Id int64 `json:"id"`
}

type InventoryInfo struct {
	Id             int64   `json:"id"`
	WarehouseId    int64   `json:"warehouseId"`
	LocationId     int64   `json:"locationId"`
	ProductId      int64   `json:"productId"`
	Sku            string  `json:"sku"`
	Quantity       int64   `json:"quantity"`
	AvailableQty   int64   `json:"availableQty"`
	LockedQty      int64   `json:"lockedQty"`
	Version        int64   `json:"version"`
	BatchNo        string  `json:"batchNo"`
	ProductionDate string  `json:"productionDate"`
	ExpiryDate     string  `json:"expiryDate"`
	CreateTime     string  `json:"createTime"`
}

type InventoryListReq struct {
	Page        int64  `form:"page"`
	PageSize    int64  `form:"pageSize"`
	WarehouseId int64  `form:"warehouseId,optional"`
	LocationId  int64  `form:"locationId,optional"`
	ProductId   int64  `form:"productId,optional"`
	Sku         string `form:"sku,optional"`
}

type InventoryListResp struct {
	Total int64           `json:"total"`
	List  []InventoryInfo `json:"list"`
}

type InboundOrderInfo struct {
	Id           int64  `json:"id"`
	OrderNo      string `json:"orderNo"`
	WarehouseId  int64  `json:"warehouseId"`
	OrderType    int64  `json:"orderType"`
	Supplier     string `json:"supplier"`
	TotalQty     int64  `json:"totalQty"`
	InboundQty   int64  `json:"inboundQty"`
	Status       int64  `json:"status"`
	Operator     string `json:"operator"`
	AuditTime    string `json:"auditTime"`
	CompleteTime string `json:"completeTime"`
	Remark       string `json:"remark"`
	CreateTime   string `json:"createTime"`
}

type InboundOrderListReq struct {
	Page        int64  `form:"page"`
	PageSize    int64  `form:"pageSize"`
	WarehouseId int64  `form:"warehouseId,optional"`
	OrderType   int64  `form:"orderType,optional"`
	Status      int64  `form:"status,optional"`
	OrderNo     string `form:"orderNo,optional"`
	Supplier    string `form:"supplier,optional"`
}

type InboundOrderListResp struct {
	Total int64              `json:"total"`
	List  []InboundOrderInfo `json:"list"`
}

type InboundOrderCreateReq struct {
	OrderNo     string `json:"orderNo"`
	WarehouseId int64  `json:"warehouseId"`
	OrderType   int64  `json:"orderType"`
	Supplier    string `json:"supplier"`
	TotalQty    int64  `json:"totalQty"`
	Status      int64  `json:"status"`
	Operator    string `json:"operator"`
	Remark      string `json:"remark"`
}

type InboundOrderUpdateReq struct {
	Id          int64  `json:"id"`
	OrderNo     string `json:"orderNo"`
	WarehouseId int64  `json:"warehouseId"`
	OrderType   int64  `json:"orderType"`
	Supplier    string `json:"supplier"`
	TotalQty    int64  `json:"totalQty"`
	InboundQty  int64  `json:"inboundQty"`
	Status      int64  `json:"status"`
	Operator    string `json:"operator"`
	Remark      string `json:"remark"`
}

type InboundOrderDeleteReq struct {
	Id int64 `json:"id"`
}

type OutboundOrderInfo struct {
	Id           int64  `json:"id"`
	OrderNo      string `json:"orderNo"`
	WarehouseId  int64  `json:"warehouseId"`
	OrderType    int64  `json:"orderType"`
	Customer     string `json:"customer"`
	TotalQty     int64  `json:"totalQty"`
	OutboundQty  int64  `json:"outboundQty"`
	Status       int64  `json:"status"`
	Operator     string `json:"operator"`
	AuditTime    string `json:"auditTime"`
	CompleteTime string `json:"completeTime"`
	Remark       string `json:"remark"`
	CreateTime   string `json:"createTime"`
}

type OutboundOrderListReq struct {
	Page        int64  `form:"page"`
	PageSize    int64  `form:"pageSize"`
	WarehouseId int64  `form:"warehouseId,optional"`
	OrderType   int64  `form:"orderType,optional"`
	Status      int64  `form:"status,optional"`
	OrderNo     string `form:"orderNo,optional"`
	Customer    string `form:"customer,optional"`
}

type OutboundOrderListResp struct {
	Total int64               `json:"total"`
	List  []OutboundOrderInfo `json:"list"`
}

type OutboundOrderCreateReq struct {
	OrderNo     string `json:"orderNo"`
	WarehouseId int64  `json:"warehouseId"`
	OrderType   int64  `json:"orderType"`
	Customer    string `json:"customer"`
	TotalQty    int64  `json:"totalQty"`
	Status      int64  `json:"status"`
	Operator    string `json:"operator"`
	Remark      string `json:"remark"`
}

type OutboundOrderUpdateReq struct {
	Id          int64  `json:"id"`
	OrderNo     string `json:"orderNo"`
	WarehouseId int64  `json:"warehouseId"`
	OrderType   int64  `json:"orderType"`
	Customer    string `json:"customer"`
	TotalQty    int64  `json:"totalQty"`
	OutboundQty int64  `json:"outboundQty"`
	Status      int64  `json:"status"`
	Operator    string `json:"operator"`
	Remark      string `json:"remark"`
}

type OutboundOrderDeleteReq struct {
	Id int64 `json:"id"`
}

type PickingTaskInfo struct {
	Id           int64  `json:"id"`
	TaskNo       string `json:"taskNo"`
	OrderId      int64  `json:"orderId"`
	OrderItemId  int64  `json:"orderItemId"`
	WarehouseId  int64  `json:"warehouseId"`
	ProductId    int64  `json:"productId"`
	Sku          string `json:"sku"`
	LocationId   int64  `json:"locationId"`
	PlanQty      int64  `json:"planQty"`
	PickQty      int64  `json:"pickQty"`
	SortOrder    int64  `json:"sortOrder"`
	Status       int64  `json:"status"`
	Operator     string `json:"operator"`
	CompleteTime string `json:"completeTime"`
	Remark       string `json:"remark"`
	CreateTime   string `json:"createTime"`
}

type PickingTaskListReq struct {
	Page        int64  `form:"page"`
	PageSize    int64  `form:"pageSize"`
	TaskNo      string `form:"taskNo,optional"`
	OrderId     int64  `form:"orderId,optional"`
	WarehouseId int64  `form:"warehouseId,optional"`
	ProductId   int64  `form:"productId,optional"`
	Sku         string `form:"sku,optional"`
	LocationId  int64  `form:"locationId,optional"`
	Status      int64  `form:"status,optional"`
	Operator    string `form:"operator,optional"`
}

type PickingTaskListResp struct {
	Total int64             `json:"total"`
	List  []PickingTaskInfo `json:"list"`
}

type PickingTaskCreateReq struct {
	TaskNo      string `json:"taskNo"`
	OrderId     int64  `json:"orderId"`
	OrderItemId int64  `json:"orderItemId"`
	WarehouseId int64  `json:"warehouseId"`
	ProductId   int64  `json:"productId"`
	Sku         string `json:"sku"`
	LocationId  int64  `json:"locationId"`
	PlanQty     int64  `json:"planQty"`
	SortOrder   int64  `json:"sortOrder"`
	Status      int64  `json:"status"`
	Operator    string `json:"operator"`
	Remark      string `json:"remark"`
}

type PickingTaskUpdateReq struct {
	Id           int64  `json:"id"`
	TaskNo       string `json:"taskNo"`
	OrderId      int64  `json:"orderId"`
	OrderItemId  int64  `json:"orderItemId"`
	WarehouseId  int64  `json:"warehouseId"`
	ProductId    int64  `json:"productId"`
	Sku          string `json:"sku"`
	LocationId   int64  `json:"locationId"`
	PlanQty      int64  `json:"planQty"`
	PickQty      int64  `json:"pickQty"`
	SortOrder    int64  `json:"sortOrder"`
	Status       int64  `json:"status"`
	Operator     string `json:"operator"`
	Remark       string `json:"remark"`
}

type PickingTaskDeleteReq struct {
	Id int64 `json:"id"`
}

type StocktakeTaskInfo struct {
	Id          int64  `json:"id"`
	TaskNo      string `json:"taskNo"`
	WarehouseId int64  `json:"warehouseId"`
	TaskName    string `json:"taskName"`
	TaskType    int64  `json:"taskType"`
	TotalSku    int64  `json:"totalSku"`
	CheckedSku  int64  `json:"checkedSku"`
	Status      int64  `json:"status"`
	Operator    string `json:"operator"`
	StartTime   string `json:"startTime"`
	EndTime     string `json:"endTime"`
	Remark      string `json:"remark"`
	CreateTime  string `json:"createTime"`
}

type StocktakeTaskListReq struct {
	Page        int64  `form:"page"`
	PageSize    int64  `form:"pageSize"`
	TaskNo      string `form:"taskNo,optional"`
	TaskName    string `form:"taskName,optional"`
	WarehouseId int64  `form:"warehouseId,optional"`
	TaskType    int64  `form:"taskType,optional"`
	Status      int64  `form:"status,optional"`
	Operator    string `form:"operator,optional"`
}

type StocktakeTaskListResp struct {
	Total int64                `json:"total"`
	List  []StocktakeTaskInfo  `json:"list"`
}

type StocktakeTaskCreateReq struct {
	TaskNo      string `json:"taskNo"`
	WarehouseId int64  `json:"warehouseId"`
	TaskName    string `json:"taskName"`
	TaskType    int64  `json:"taskType"`
	TotalSku    int64  `json:"totalSku"`
	Status      int64  `json:"status"`
	Operator    string `json:"operator"`
	Remark      string `json:"remark"`
}

type StocktakeTaskUpdateReq struct {
	Id          int64  `json:"id"`
	TaskNo      string `json:"taskNo"`
	WarehouseId int64  `json:"warehouseId"`
	TaskName    string `json:"taskName"`
	TaskType    int64  `json:"taskType"`
	TotalSku    int64  `json:"totalSku"`
	CheckedSku  int64  `json:"checkedSku"`
	Status      int64  `json:"status"`
	Operator    string `json:"operator"`
	Remark      string `json:"remark"`
}

type StocktakeTaskDeleteReq struct {
	Id int64 `json:"id"`
}

type DashboardResp struct {
	TotalWarehouse int64 `json:"totalWarehouse"`
	TotalProduct   int64 `json:"totalProduct"`
	TotalInventory int64 `json:"totalInventory"`
	InboundCount   int64 `json:"inboundCount"`
	OutboundCount  int64 `json:"outboundCount"`
	PendingTask    int64 `json:"pendingTask"`
}

type InventoryReportReq struct {
	WarehouseId int64  `form:"warehouseId,optional"`
	Sku         string `form:"sku,optional"`
}

type InventoryReportResp struct {
	TotalSku       int64 `json:"totalSku"`
	TotalQuantity  int64 `json:"totalQuantity"`
	LowStockCount  int64 `json:"lowStockCount"`
	OverStockCount int64 `json:"overStockCount"`
}

type InOutReportReq struct {
	StartDate string `form:"startDate"`
	EndDate   string `form:"endDate"`
}

type InOutReportItem struct {
	Date        string `json:"date"`
	InboundQty  int64  `json:"inboundQty"`
	OutboundQty int64  `json:"outboundQty"`
}

type InOutReportResp struct {
	TotalInbound  int64            `json:"totalInbound"`
	TotalOutbound int64            `json:"totalOutbound"`
	List          []InOutReportItem `json:"list"`
}

type InventoryAdjustReq struct {
	Id        int64  `json:"id"`
	ChangeQty int64  `json:"changeQty"`
	Reason    string `json:"reason"`
	Operator  string `json:"operator"`
}

type InboundOrderAuditReq struct {
	Id       int64  `json:"id"`
	Operator string `json:"operator"`
}

type InboundOrderPutawayReq struct {
	Id               int64  `json:"id"`
	PutawayTaskId    int64  `json:"putawayTaskId"`
	ActualLocationId int64  `json:"actualLocationId"`
	PutawayQty       int64  `json:"putawayQty"`
	Operator         string `json:"operator"`
}

type OutboundOrderAuditReq struct {
	Id       int64  `json:"id"`
	Operator string `json:"operator"`
}

type PickingTaskCompleteReq struct {
	Id       int64  `json:"id"`
	PickQty  int64  `json:"pickQty"`
	Operator string `json:"operator"`
}

type StocktakeTaskStartReq struct {
	Id       int64  `json:"id"`
	Operator string `json:"operator"`
}

type StocktakeTaskCompleteReq struct {
	Id       int64                  `json:"id"`
	Items    []StocktakeTaskItemReq `json:"items"`
	Operator string                 `json:"operator"`
}

type StocktakeTaskItemReq struct {
	ProductId    int64 `json:"productId"`
	InventoryId  int64 `json:"inventoryId"`
	SystemQty    int64 `json:"systemQty"`
	ActualQty    int64 `json:"actualQty"`
	DifferenceQty int64 `json:"differenceQty"`
}

type InventoryLogListReq struct {
	Page         int64  `form:"page"`
	PageSize     int64  `form:"pageSize"`
	WarehouseId  int64  `form:"warehouseId,optional"`
	LocationId   int64  `form:"locationId,optional"`
	ProductId    int64  `form:"productId,optional"`
	Sku          string `form:"sku,optional"`
	LogType      int64  `form:"logType,optional"`
	BusinessType int64  `form:"businessType,optional"`
	BusinessNo   string `form:"businessNo,optional"`
}

type InventoryLogInfo struct {
	Id           int64  `json:"id"`
	LogNo        string `json:"logNo"`
	WarehouseId  int64  `json:"warehouseId"`
	LocationId   int64  `json:"locationId"`
	ProductId    int64  `json:"productId"`
	Sku          string `json:"sku"`
	LogType      int64  `json:"logType"`
	BusinessType int64  `json:"businessType"`
	BusinessNo   string `json:"businessNo"`
	BeforeQty    int64  `json:"beforeQty"`
	ChangeQty    int64  `json:"changeQty"`
	AfterQty     int64  `json:"afterQty"`
	Operator     string `json:"operator"`
	Remark       string `json:"remark"`
	CreateTime   string `json:"createTime"`
}

type InventoryLogListResp struct {
	Total int64             `json:"total"`
	List  []InventoryLogInfo `json:"list"`
}

type StocktakeProfitLossResp struct {
	Id             int64  `json:"id"`
	TaskNo         string `json:"taskNo"`
	ProductId      int64  `json:"productId"`
	Sku            string `json:"sku"`
	SystemQty      int64  `json:"systemQty"`
	ActualQty      int64  `json:"actualQty"`
	DifferenceQty  int64  `json:"differenceQty"`
	DifferenceType int64  `json:"differenceType"`
}
