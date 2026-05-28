package model

import (
	"time"

	"gorm.io/gorm"
)

type BaseModel struct {
	ID        uint64         `gorm:"primarykey;autoIncrement" json:"id"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

type User struct {
	BaseModel
	Username string `gorm:"size:50;uniqueIndex;not null" json:"username"`
	Password string `gorm:"size:255;not null" json:"-"`
	RealName string `gorm:"size:50" json:"real_name"`
	Phone    string `gorm:"size:20" json:"phone"`
	Email    string `gorm:"size:100" json:"email"`
	Role     int8   `gorm:"not null;default:1" json:"role"`
	Status   int8   `gorm:"not null;default:1" json:"status"`
}

func (User) TableName() string {
	return "users"
}

type Drama struct {
	BaseModel
	DramaNo       string    `gorm:"size:64;uniqueIndex;not null" json:"drama_no"`
	Title         string    `gorm:"size:200;not null" json:"title"`
	Description   string    `gorm:"type:text" json:"description"`
	CoverURL      string    `gorm:"size:500" json:"cover_url"`
	TotalEpisodes int       `gorm:"not null;default:0" json:"total_episodes"`
	Duration      int       `json:"duration"`
	ReleaseDate   time.Time `json:"release_date"`
	Status        int8      `gorm:"not null;default:0" json:"status"`
	CreatedBy     uint64    `gorm:"not null" json:"created_by"`
}

func (Drama) TableName() string {
	return "dramas"
}

type StakeholderType struct {
	ID          uint32 `gorm:"primarykey;autoIncrement" json:"id"`
	TypeCode    string `gorm:"size:32;uniqueIndex;not null" json:"type_code"`
	TypeName    string `gorm:"size:50;not null" json:"type_name"`
	Description string `gorm:"size:200" json:"description"`
	SortOrder   int    `gorm:"not null;default:0" json:"sort_order"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (StakeholderType) TableName() string {
	return "stakeholder_types"
}

type Stakeholder struct {
	BaseModel
	StakeholderNo string `gorm:"size:64;uniqueIndex;not null" json:"stakeholder_no"`
	TypeCode      string `gorm:"size:32;index;not null" json:"type_code"`
	Name          string `gorm:"size:100;not null" json:"name"`
	ContactPerson string `gorm:"size:50" json:"contact_person"`
	ContactPhone  string `gorm:"size:20" json:"contact_phone"`
	BankAccount   string `gorm:"size:100" json:"bank_account"`
	BankName      string `gorm:"size:100" json:"bank_name"`
	IDCard        string `gorm:"size:32" json:"id_card"`
	Status        int8   `gorm:"not null;default:1" json:"status"`
	CreatedBy     uint64 `gorm:"not null" json:"created_by"`
}

func (Stakeholder) TableName() string {
	return "stakeholders"
}

type DramaRight struct {
	BaseModel
	DramaID        uint64    `gorm:"uniqueIndex:idx_drama_stakeholder;not null" json:"drama_id"`
	StakeholderID  uint64    `gorm:"uniqueIndex:idx_drama_stakeholder;not null" json:"stakeholder_id"`
	RoleName       string    `gorm:"size:100" json:"role_name"`
	BaseRatio      float64   `gorm:"type:decimal(8,4);not null;default:0.0000" json:"base_ratio"`
	IsActive       int8      `gorm:"not null;default:1" json:"is_active"`
	EffectiveDate  time.Time `json:"effective_date"`
	ExpireDate     time.Time `json:"expire_date"`
	Remark         string    `gorm:"size:500" json:"remark"`
	CreatedBy      uint64    `gorm:"not null" json:"created_by"`
}

func (DramaRight) TableName() string {
	return "drama_rights"
}

type ProfitShareRule struct {
	BaseModel
	RuleNo        string    `gorm:"size:64;uniqueIndex;not null" json:"rule_no"`
	RuleName      string    `gorm:"size:100;not null" json:"rule_name"`
	RuleType      int8      `gorm:"not null;default:1" json:"rule_type"`
	DSLContent    string    `gorm:"type:text;not null" json:"dsl_content"`
	Description   string    `gorm:"size:500" json:"description"`
	Priority      int       `gorm:"not null;default:0" json:"priority"`
	Status        int8      `gorm:"not null;default:0" json:"status"`
	EffectiveDate time.Time `json:"effective_date"`
	ExpireDate    time.Time `json:"expire_date"`
	CreatedBy     uint64    `gorm:"not null" json:"created_by"`
}

func (ProfitShareRule) TableName() string {
	return "profit_share_rules"
}

type DramaRuleRelation struct {
	ID        uint64    `gorm:"primarykey;autoIncrement" json:"id"`
	DramaID   uint64    `gorm:"uniqueIndex:idx_drama_rule;not null" json:"drama_id"`
	RuleID    uint64    `gorm:"uniqueIndex:idx_drama_rule;not null" json:"rule_id"`
	CreatedBy uint64    `gorm:"not null" json:"created_by"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (DramaRuleRelation) TableName() string {
	return "drama_rule_relations"
}

type PlayData struct {
	BaseModel
	DataNo       string    `gorm:"size:64;index;not null" json:"data_no"`
	DramaID      uint64    `gorm:"uniqueIndex:idx_drama_date_episode;not null" json:"drama_id"`
	EpisodeNo    int       `gorm:"uniqueIndex:idx_drama_date_episode;not null;default:0" json:"episode_no"`
	PlayCount    int64     `gorm:"not null;default:0" json:"play_count"`
	PlayDuration int64     `gorm:"not null;default:0" json:"play_duration"`
	UniqueViewers int64    `gorm:"not null;default:0" json:"unique_viewers"`
	DataDate     time.Time `gorm:"uniqueIndex:idx_drama_date_episode;not null" json:"data_date"`
	DataSource   string    `gorm:"size:50;not null" json:"data_source"`
	Status       int8      `gorm:"not null;default:1" json:"status"`
}

func (PlayData) TableName() string {
	return "play_data"
}

type PaymentData struct {
	BaseModel
	DataNo        string    `gorm:"size:64;index;not null" json:"data_no"`
	DramaID       uint64    `gorm:"uniqueIndex:idx_drama_date_episode;not null" json:"drama_id"`
	EpisodeNo     int       `gorm:"uniqueIndex:idx_drama_date_episode;not null;default:0" json:"episode_no"`
	PaymentAmount float64   `gorm:"type:decimal(18,2);not null;default:0.00" json:"payment_amount"`
	PaymentCount  int       `gorm:"not null;default:0" json:"payment_count"`
	UniquePayers  int       `gorm:"not null;default:0" json:"unique_payers"`
	DataDate      time.Time `gorm:"uniqueIndex:idx_drama_date_episode;not null" json:"data_date"`
	DataSource    string    `gorm:"size:50;not null" json:"data_source"`
	Status        int8      `gorm:"not null;default:1" json:"status"`
}

func (PaymentData) TableName() string {
	return "payment_data"
}

type ShareCalculationTask struct {
	BaseModel
	TaskNo           string    `gorm:"size:64;uniqueIndex;not null" json:"task_no"`
	DramaID          uint64    `gorm:"index:idx_drama_period;not null" json:"drama_id"`
	SettlementPeriod string    `gorm:"size:20;index:idx_drama_period;not null" json:"settlement_period"`
	TaskType         int8      `gorm:"not null;default:1" json:"task_type"`
	Status           int8      `gorm:"index;not null;default:0" json:"status"`
	RetryCount       int       `gorm:"not null;default:0" json:"retry_count"`
	LastRetryAt      time.Time `json:"last_retry_at"`
	IdempotentKey    string    `gorm:"size:128;uniqueIndex;not null" json:"idempotent_key"`
	ErrorMessage     string    `gorm:"type:text" json:"error_message"`
	FinishedAt       time.Time `json:"finished_at"`
}

func (ShareCalculationTask) TableName() string {
	return "share_calculation_tasks"
}

type ShareDetail struct {
	BaseModel
	DetailNo         string  `gorm:"size:64;uniqueIndex;not null" json:"detail_no"`
	TaskID           uint64  `gorm:"index;not null" json:"task_id"`
	DramaID          uint64  `gorm:"index:idx_drama_stakeholder_period;not null" json:"drama_id"`
	StakeholderID    uint64  `gorm:"index:idx_drama_stakeholder_period;not null" json:"stakeholder_id"`
	SettlementPeriod string  `gorm:"size:20;index:idx_drama_stakeholder_period;index;not null" json:"settlement_period"`
	RevenueType      int8    `gorm:"not null;default:1" json:"revenue_type"`
	TotalRevenue     float64 `gorm:"type:decimal(18,2);not null;default:0.00" json:"total_revenue"`
	ShareRatio       float64 `gorm:"type:decimal(8,4);not null;default:0.0000" json:"share_ratio"`
	ShareAmount      float64 `gorm:"type:decimal(18,2);not null;default:0.00" json:"share_amount"`
	RuleID           uint64  `json:"rule_id"`
	CalculationLog   string  `gorm:"type:text" json:"calculation_log"`
}

func (ShareDetail) TableName() string {
	return "share_details"
}

type SettlementOrder struct {
	BaseModel
	SettlementNo          string    `gorm:"size:64;uniqueIndex;not null" json:"settlement_no"`
	StakeholderID         uint64    `gorm:"uniqueIndex:idx_stakeholder_period;index;not null" json:"stakeholder_id"`
	SettlementPeriod      string    `gorm:"size:20;uniqueIndex:idx_stakeholder_period;index;not null" json:"settlement_period"`
	TotalShareAmount      float64   `gorm:"type:decimal(18,2);not null;default:0.00" json:"total_share_amount"`
	DeductionAmount       float64   `gorm:"type:decimal(18,2);not null;default:0.00" json:"deduction_amount"`
	ActualSettlementAmount float64  `gorm:"type:decimal(18,2);not null;default:0.00" json:"actual_settlement_amount"`
	TailDiffAmount        float64   `gorm:"type:decimal(18,2);not null;default:0.00" json:"tail_diff_amount"`
	Status                int8      `gorm:"index;not null;default:0" json:"status"`
	HashSignature         string    `gorm:"size:512;not null" json:"hash_signature"`
	ConfirmedBy           uint64    `json:"confirmed_by"`
	ConfirmedAt           time.Time `json:"confirmed_at"`
	PaidAt                time.Time `json:"paid_at"`
	Remark                string    `gorm:"size:500" json:"remark"`
	CreatedBy             uint64    `gorm:"not null" json:"created_by"`
}

func (SettlementOrder) TableName() string {
	return "settlement_orders"
}

type SettlementOrderDetail struct {
	ID                 uint64    `gorm:"primarykey;autoIncrement" json:"id"`
	SettlementOrderID  uint64    `gorm:"index;not null" json:"settlement_order_id"`
	ShareDetailID      uint64    `gorm:"index;not null" json:"share_detail_id"`
	DramaID            uint64    `gorm:"not null" json:"drama_id"`
	RevenueType        int8      `gorm:"not null" json:"revenue_type"`
	ShareAmount        float64   `gorm:"type:decimal(18,2);not null;default:0.00" json:"share_amount"`
	CreatedAt          time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (SettlementOrderDetail) TableName() string {
	return "settlement_order_details"
}

type ReconciliationRecord struct {
	BaseModel
	ReconciliationNo     string    `gorm:"size:64;uniqueIndex;not null" json:"reconciliation_no"`
	DramaID              uint64    `gorm:"uniqueIndex:idx_drama_period;not null" json:"drama_id"`
	SettlementPeriod     string    `gorm:"size:20;uniqueIndex:idx_drama_period;index;not null" json:"settlement_period"`
	SystemPlayCount      int64     `gorm:"not null;default:0" json:"system_play_count"`
	ThirdPartyPlayCount  int64     `gorm:"not null;default:0" json:"third_party_play_count"`
	PlayCountDiff        int64     `gorm:"not null;default:0" json:"play_count_diff"`
	SystemPaymentAmount  float64   `gorm:"type:decimal(18,2);not null;default:0.00" json:"system_payment_amount"`
	ThirdPartyPaymentAmount float64 `gorm:"type:decimal(18,2);not null;default:0.00" json:"third_party_payment_amount"`
	PaymentAmountDiff    float64   `gorm:"type:decimal(18,2);not null;default:0.00" json:"payment_amount_diff"`
	Status               int8      `gorm:"index;not null;default:0" json:"status"`
	AdjustmentRemark     string    `gorm:"size:500" json:"adjustment_remark"`
	CreatedBy            uint64    `gorm:"not null" json:"created_by"`
	ReconciledAt         time.Time `json:"reconciled_at"`
}

func (ReconciliationRecord) TableName() string {
	return "reconciliation_records"
}

type ReconciliationDetail struct {
	ID               uint64    `gorm:"primarykey;autoIncrement" json:"id"`
	ReconciliationID uint64    `gorm:"index;not null" json:"reconciliation_id"`
	DataType         int8      `gorm:"not null" json:"data_type"`
	DataDate         time.Time `gorm:"index;not null" json:"data_date"`
	SystemValue      float64   `gorm:"type:decimal(18,2);not null;default:0.00" json:"system_value"`
	ThirdPartyValue  float64   `gorm:"type:decimal(18,2);not null;default:0.00" json:"third_party_value"`
	DiffValue        float64   `gorm:"type:decimal(18,2);not null;default:0.00" json:"diff_value"`
	DiffRatio        float64   `gorm:"type:decimal(8,4);not null;default:0.0000" json:"diff_ratio"`
	CreatedAt        time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (ReconciliationDetail) TableName() string {
	return "reconciliation_details"
}

type CopyrightAuthorization struct {
	BaseModel
	AuthorizationNo   string    `gorm:"size:64;uniqueIndex;not null" json:"authorization_no"`
	DramaID           uint64    `gorm:"index;not null" json:"drama_id"`
	AuthorizerID      uint64    `gorm:"index;not null" json:"authorizer_id"`
	LicenseeID        uint64    `gorm:"index;not null" json:"licensee_id"`
	AuthorizationType int8      `gorm:"not null;default:1" json:"authorization_type"`
	AuthorizationScope string   `gorm:"size:200;not null" json:"authorization_scope"`
	RightsType        string    `gorm:"size:100;not null" json:"rights_type"`
	EffectiveDate     time.Time `gorm:"index;not null" json:"effective_date"`
	ExpireDate        time.Time `gorm:"index;not null" json:"expire_date"`
	AuthorizationFee  float64   `gorm:"type:decimal(18,2)" json:"authorization_fee"`
	ContractNo        string    `gorm:"size:100" json:"contract_no"`
	Status            int8      `gorm:"index;not null;default:0" json:"status"`
	Remark            string    `gorm:"size:500" json:"remark"`
	CreatedBy         uint64    `gorm:"not null" json:"created_by"`
	RevokedAt         time.Time `json:"revoked_at"`
	RevokedBy         uint64    `json:"revoked_by"`
}

func (CopyrightAuthorization) TableName() string {
	return "copyright_authorizations"
}

type OperationLog struct {
	ID            uint64    `gorm:"primarykey;autoIncrement" json:"id"`
	UserID        uint64    `gorm:"index;not null" json:"user_id"`
	Username      string    `gorm:"size:50;not null" json:"username"`
	Module        string    `gorm:"size:50;index;not null" json:"module"`
	Operation     string    `gorm:"size:100;not null" json:"operation"`
	Method        string    `gorm:"size:20" json:"method"`
	Path          string    `gorm:"size:200" json:"path"`
	Params        string    `gorm:"type:text" json:"params"`
	Result        int8      `json:"result"`
	ErrorMsg      string    `gorm:"size:500" json:"error_msg"`
	IP            string    `gorm:"size:50" json:"ip"`
	UserAgent     string    `gorm:"size:500" json:"user_agent"`
	ExecutionTime int       `json:"execution_time"`
	CreatedAt     time.Time `gorm:"index;autoCreateTime" json:"created_at"`
}

func (OperationLog) TableName() string {
	return "operation_logs"
}
