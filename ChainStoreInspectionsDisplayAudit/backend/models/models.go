package models

import (
	"time"
)

type User struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Username    string    `gorm:"size:50;not null;unique" json:"username"`
	Password    string    `gorm:"size:255;not null" json:"-"`
	RealName    string    `gorm:"size:50;not null" json:"realName"`
	Phone       string    `gorm:"size:20" json:"phone"`
	Email       string    `gorm:"size:100" json:"email"`
	Role        string    `gorm:"size:20;not null;default:inspector" json:"role"`
	Avatar      string    `gorm:"size:255" json:"avatar"`
	Department  string    `gorm:"size:100" json:"department"`
	Status      int8      `gorm:"default:1" json:"status"`
	LastLoginAt time.Time `json:"lastLoginAt"`
	LastLoginIP string    `gorm:"size:50" json:"lastLoginIp"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

type Store struct {
	ID           uint64  `gorm:"primaryKey;autoIncrement" json:"id"`
	StoreCode    string  `gorm:"size:50;not null;unique" json:"storeCode"`
	StoreName    string  `gorm:"size:100;not null" json:"storeName"`
	Address      string  `gorm:"size:255;not null" json:"address"`
	Province     string  `gorm:"size:50" json:"province"`
	City         string  `gorm:"size:50" json:"city"`
	District     string  `gorm:"size:50" json:"district"`
	Longitude    float64 `gorm:"type:decimal(10,7)" json:"longitude"`
	Latitude     float64 `gorm:"type:decimal(10,7)" json:"latitude"`
	ManagerName  string  `gorm:"size:50" json:"managerName"`
	ManagerPhone string  `gorm:"size:20" json:"managerPhone"`
	Area         string  `gorm:"size:50" json:"area"`
	Status       int8    `gorm:"default:1" json:"status"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

type ChecklistTemplate struct {
	ID          uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	TemplateName string `gorm:"size:100;not null" json:"templateName"`
	TemplateType string `gorm:"size:50;not null" json:"templateType"`
	Description string    `gorm:"type:text" json:"description"`
	TotalScore  int       `gorm:"default:100" json:"totalScore"`
	PassScore   int       `gorm:"default:60" json:"passScore"`
	Version     string    `gorm:"size:20;default:1.0" json:"version"`
	Status      int8      `gorm:"default:1" json:"status"`
	CreatorID   uint64    `json:"creatorId"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
	Items       []ChecklistItem `gorm:"foreignKey:TemplateID" json:"items,omitempty"`
}

type ChecklistItem struct {
	ID              uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	TemplateID      uint64 `gorm:"not null" json:"templateId"`
	ItemCode        string `gorm:"size:50;not null" json:"itemCode"`
	ItemName        string `gorm:"size:200;not null" json:"itemName"`
	ItemDescription string    `gorm:"type:text" json:"itemDescription"`
	Category        string    `gorm:"size:50" json:"category"`
	Score           int       `gorm:"default:10" json:"score"`
	SortOrder       int       `gorm:"default:0" json:"sortOrder"`
	IsRequired      int8      `gorm:"default:1" json:"isRequired"`
	NeedPhoto       int8      `gorm:"default:0" json:"needPhoto"`
	ScoringCriteria string    `gorm:"type:text" json:"scoringCriteria"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

type InspectionTask struct {
	ID          uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskCode    string `gorm:"size:50;not null;unique" json:"taskCode"`
	TaskName    string `gorm:"size:100;not null" json:"taskName"`
	TaskType    string `gorm:"size:50;not null" json:"taskType"`
	TemplateID  uint64    `gorm:"not null" json:"templateId"`
	StoreID     uint64    `gorm:"not null" json:"storeId"`
	InspectorID uint64    `gorm:"not null" json:"inspectorId"`
	PlanDate    string    `gorm:"type:date" json:"planDate"`
	StartTime   time.Time `json:"startTime"`
	EndTime     time.Time `json:"endTime"`
	Status      string    `gorm:"size:20;default:pending" json:"status"`
	Priority    int8      `gorm:"default:2" json:"priority"`
	Remark      string    `gorm:"type:text" json:"remark"`
	ActualScore int       `json:"actualScore"`
	IsPass      int8      `json:"isPass"`
	CreatorID   uint64    `json:"creatorId"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
	Store       Store     `gorm:"foreignKey:StoreID" json:"store,omitempty"`
	Inspector   User      `gorm:"foreignKey:InspectorID" json:"inspector,omitempty"`
	Template    ChecklistTemplate `gorm:"foreignKey:TemplateID" json:"template,omitempty"`
}

type InspectionRecord struct {
	ID              uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskID          uint64 `gorm:"not null" json:"taskId"`
	ItemID          uint64 `gorm:"not null" json:"itemId"`
	Score           int       `json:"score"`
	IsPass          int8      `json:"isPass"`
	CheckResult     string    `gorm:"type:text" json:"checkResult"`
	InspectorID     uint64    `gorm:"not null" json:"inspectorId"`
	CheckTime       time.Time `json:"checkTime"`
	Longitude       float64   `gorm:"type:decimal(10,7)" json:"longitude"`
	Latitude        float64   `gorm:"type:decimal(10,7)" json:"latitude"`
	LocationAddress string    `gorm:"size:255" json:"locationAddress"`
	HasPhoto        int8      `gorm:"default:0" json:"hasPhoto"`
	OfflineID       string    `gorm:"size:64" json:"offlineId"`
	SyncStatus      int8      `gorm:"default:1" json:"syncStatus"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
	Photos          []Photo   `gorm:"foreignKey:RecordID" json:"photos,omitempty"`
	Item            ChecklistItem `gorm:"foreignKey:ItemID" json:"item,omitempty"`
}

type Photo struct {
	ID              uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	RecordID        uint64 `json:"recordId"`
	IssueID         uint64 `json:"issueId"`
	PhotoURL        string    `gorm:"size:255;not null" json:"photoUrl"`
	ThumbnailURL    string    `gorm:"size:255" json:"thumbnailUrl"`
	PhotoType       string    `gorm:"size:20;default:inspection" json:"photoType"`
	Longitude       float64   `gorm:"type:decimal(10,7);not null" json:"longitude"`
	Latitude        float64   `gorm:"type:decimal(10,7);not null" json:"latitude"`
	LocationAddress string    `gorm:"size:255" json:"locationAddress"`
	ShootTime       time.Time `gorm:"not null" json:"shootTime"`
	DeviceType      string    `gorm:"size:50" json:"deviceType"`
	DeviceModel     string    `gorm:"size:100" json:"deviceModel"`
	DeviceUUID      string    `gorm:"size:100" json:"deviceUuid"`
	FileSize        int64     `json:"fileSize"`
	FileHash        string    `gorm:"size:64" json:"fileHash"`
	IsValid         int8      `gorm:"default:1" json:"isValid"`
	UploaderID      uint64    `json:"uploaderId"`
	OfflineID       string    `gorm:"size:64" json:"offlineId"`
	SyncStatus      int8      `gorm:"default:1" json:"syncStatus"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

type Issue struct {
	ID                uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	IssueCode         string `gorm:"size:50;not null;unique" json:"issueCode"`
	TaskID            uint64 `gorm:"not null" json:"taskId"`
	RecordID          uint64 `json:"recordId"`
	ItemID            uint64 `json:"itemId"`
	StoreID           uint64    `gorm:"not null" json:"storeId"`
	Title             string    `gorm:"size:200;not null" json:"title"`
	Description       string    `gorm:"type:text" json:"description"`
	IssueLevel        string    `gorm:"size:20;default:normal" json:"issueLevel"`
	IssueType         string    `gorm:"size:50" json:"issueType"`
	Status            string    `gorm:"size:20;default:pending" json:"status"`
	DiscovererID      uint64    `gorm:"not null" json:"discovererId"`
	DiscoverTime      time.Time `gorm:"not null" json:"discoverTime"`
	AssigneeID        uint64    `json:"assigneeId"`
	Deadline          string    `gorm:"type:date" json:"deadline"`
	ActualResolveTime time.Time `json:"actualResolveTime"`
	IsRectified       int8      `gorm:"default:0" json:"isRectified"`
	RectificationCount int      `gorm:"default:0" json:"rectificationCount"`
	OfflineID         string    `gorm:"size:64" json:"offlineId"`
	SyncStatus        int8      `gorm:"default:1" json:"syncStatus"`
	CreatedAt         time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt         time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
	Store             Store     `gorm:"foreignKey:StoreID" json:"store,omitempty"`
	Discoverer        User      `gorm:"foreignKey:DiscovererID" json:"discoverer,omitempty"`
	Assignee          User      `gorm:"foreignKey:AssigneeID" json:"assignee,omitempty"`
	Photos            []Photo   `gorm:"foreignKey:IssueID" json:"photos,omitempty"`
	Rectifications    []Rectification `gorm:"foreignKey:IssueID" json:"rectifications,omitempty"`
}

type Rectification struct {
	ID                uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	IssueID           uint64 `gorm:"not null" json:"issueId"`
	RectificationNo   string `gorm:"size:50;not null;unique" json:"rectificationNo"`
	Status            string    `gorm:"size:20;default:pending" json:"status"`
	Description       string    `gorm:"type:text" json:"description"`
	RectifierID       uint64    `gorm:"not null" json:"rectifierId"`
	SubmitTime        time.Time `json:"submitTime"`
	RecheckerID       uint64    `json:"recheckerId"`
	RecheckTime       time.Time `json:"recheckTime"`
	RecheckResult     string    `gorm:"type:text" json:"recheckResult"`
	RecheckLongitude  float64   `gorm:"type:decimal(10,7)" json:"recheckLongitude"`
	RecheckLatitude   float64   `gorm:"type:decimal(10,7)" json:"recheckLatitude"`
	Deadline          string    `gorm:"type:date" json:"deadline"`
	IsOverdue         int8      `gorm:"default:0" json:"isOverdue"`
	OfflineID         string    `gorm:"size:64" json:"offlineId"`
	SyncStatus        int8      `gorm:"default:1" json:"syncStatus"`
	CreatedAt         time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt         time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
	Rectifier         User      `gorm:"foreignKey:RectifierID" json:"rectifier,omitempty"`
	Rechecker         User      `gorm:"foreignKey:RecheckerID" json:"rechecker,omitempty"`
	StatusLogs        []RectificationStatusLog `gorm:"foreignKey:RectificationID" json:"statusLogs,omitempty"`
}

type RectificationStatusLog struct {
	ID              uint64 `gorm:"primaryKey;autoIncrement" json:"id"`
	RectificationID uint64 `gorm:"not null" json:"rectificationId"`
	IssueID         uint64 `gorm:"not null" json:"issueId"`
	FromStatus      string    `gorm:"size:20" json:"fromStatus"`
	ToStatus        string    `gorm:"size:20;not null" json:"toStatus"`
	OperatorID      uint64    `gorm:"not null" json:"operatorId"`
	OperateTime     time.Time `gorm:"autoCreateTime" json:"operateTime"`
	Remark          string    `gorm:"type:text" json:"remark"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"createdAt"`
	Operator        User      `gorm:"foreignKey:OperatorID" json:"operator,omitempty"`
}

type StoreScore struct {
	ID                uint64  `gorm:"primaryKey;autoIncrement" json:"id"`
	StoreID           uint64  `gorm:"not null" json:"storeId"`
	PeriodType        string  `gorm:"size:20;not null;default:month" json:"periodType"`
	PeriodValue       string  `gorm:"size:20;not null" json:"periodValue"`
	TaskCount         int     `gorm:"default:0" json:"taskCount"`
	CompletedCount    int     `gorm:"default:0" json:"completedCount"`
	TotalScore        float64 `gorm:"type:decimal(10,2);default:0" json:"totalScore"`
	AvgScore          float64 `gorm:"type:decimal(5,2);default:0" json:"avgScore"`
	PassRate          float64 `gorm:"type:decimal(5,2);default:0" json:"passRate"`
	IssueCount        int     `gorm:"default:0" json:"issueCount"`
	RectifiedCount    int     `gorm:"default:0" json:"rectifiedCount"`
	RectificationRate float64 `gorm:"type:decimal(5,2);default:0" json:"rectificationRate"`
	Rank              int     `json:"rank"`
	LastRank          int     `json:"lastRank"`
	RankChange        int     `json:"rankChange"`
	CreatedAt         time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt         time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
	Store             Store     `gorm:"foreignKey:StoreID" json:"store,omitempty"`
}

type InspectionReport struct {
	ID            uint64          `gorm:"primaryKey;autoIncrement" json:"id"`
	ReportCode    string          `gorm:"size:50;not null;unique" json:"reportCode"`
	ReportType    string          `gorm:"size:20;not null" json:"reportType"`
	ReportName    string          `gorm:"size:200;not null" json:"reportName"`
	TaskID        uint64          `json:"taskId"`
	StoreID       uint64          `json:"storeId"`
	PeriodType    string          `gorm:"size:20" json:"periodType"`
	PeriodValue   string          `gorm:"size:20" json:"periodValue"`
	Content       string          `gorm:"type:json" json:"content"`
	Summary       string          `gorm:"type:text" json:"summary"`
	TotalScore    int             `json:"totalScore"`
	AvgScore      float64         `gorm:"type:decimal(5,2)" json:"avgScore"`
	PassRate      float64         `gorm:"type:decimal(5,2)" json:"passRate"`
	IssueCount    int             `json:"issueCount"`
	RectifiedCount int            `json:"rectifiedCount"`
	CreatorID     uint64          `gorm:"not null" json:"creatorId"`
	CreatedAt     time.Time       `gorm:"autoCreateTime" json:"createdAt"`
}

type OfflineSyncRecord struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	SyncBatchNo   string    `gorm:"size:64;not null" json:"syncBatchNo"`
	DeviceUUID    string    `gorm:"size:100;not null" json:"deviceUuid"`
	UserID        uint64    `gorm:"not null" json:"userId"`
	DataType      string    `gorm:"size:50;not null" json:"dataType"`
	DataCount     int       `gorm:"default:0" json:"dataCount"`
	SyncStatus    string    `gorm:"size:20;default:pending" json:"syncStatus"`
	SyncTime      time.Time `json:"syncTime"`
	ErrorMsg      string    `gorm:"type:text" json:"errorMsg"`
	DataJSON      string    `gorm:"type:longtext" json:"dataJson"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type Pagination struct {
	Page     int `json:"page" form:"page"`
	PageSize int `json:"pageSize" form:"pageSize"`
	Total    int64 `json:"total"`
}
