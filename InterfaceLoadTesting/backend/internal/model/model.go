package model

import (
	"time"
)

type User struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Username  string    `gorm:"size:50;not null;unique" json:"username"`
	Password  string    `gorm:"size:255;not null" json:"-"`
	Email     string    `gorm:"size:100" json:"email"`
	Role      int8      `gorm:"not null;default:1" json:"role"`
	Status    int8      `gorm:"not null;default:1" json:"status"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}

type Target struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	BaseURL     string    `gorm:"size:255;not null" json:"base_url"`
	Description string    `gorm:"type:text" json:"description"`
	AllowedIPs  string    `gorm:"type:text" json:"allowed_ips"`
	AuthToken   string    `gorm:"size:255" json:"auth_token"`
	Status      int8      `gorm:"not null;default:1" json:"status"`
	CreatedBy   uint64    `gorm:"not null" json:"created_by"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Target) TableName() string {
	return "targets"
}

type Task struct {
	ID          uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string     `gorm:"size:100;not null" json:"name"`
	TargetID    uint64     `gorm:"not null" json:"target_id"`
	Method      string     `gorm:"size:10;not null;default:'GET'" json:"method"`
	Path        string     `gorm:"size:255;not null" json:"path"`
	Headers     string     `gorm:"type:text" json:"headers"`
	Body        string     `gorm:"type:text" json:"body"`
	Concurrency int        `gorm:"not null;default:10" json:"concurrency"`
	Duration    int        `gorm:"not null;default:60" json:"duration"`
	RampUp      int        `gorm:"not null;default:0" json:"ramp_up"`
	Steps       *int       `json:"steps"`
	QPSLimit    *int       `json:"qps_limit"`
	Timeout     int        `gorm:"not null;default:30" json:"timeout"`
	Status      int8       `gorm:"not null;default:0" json:"status"`
	Progress    int        `gorm:"not null;default:0" json:"progress"`
	StartedAt   *time.Time `json:"started_at"`
	EndedAt     *time.Time `json:"ended_at"`
	CreatedBy   uint64     `gorm:"not null" json:"created_by"`
	CreatedAt   time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Task) TableName() string {
	return "tasks"
}

type TaskNode struct {
	ID          uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskID      uint64     `gorm:"not null" json:"task_id"`
	NodeID      string     `gorm:"size:50;not null" json:"node_id"`
	NodeIP      string     `gorm:"size:50" json:"node_ip"`
	Concurrency int        `gorm:"not null" json:"concurrency"`
	Status      int8       `gorm:"not null;default:0" json:"status"`
	StartedAt   *time.Time `json:"started_at"`
	EndedAt     *time.Time `json:"ended_at"`
	CreatedAt   time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (TaskNode) TableName() string {
	return "task_nodes"
}

type Metric struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskID        uint64    `gorm:"not null" json:"task_id"`
	Timestamp     time.Time `gorm:"not null" json:"timestamp"`
	QPS           int       `gorm:"not null;default:0" json:"qps"`
	AvgRT         int       `gorm:"not null;default:0" json:"avg_rt"`
	P50RT         int       `gorm:"not null;default:0" json:"p50_rt"`
	P95RT         int       `gorm:"not null;default:0" json:"p95_rt"`
	P99RT         int       `gorm:"not null;default:0" json:"p99_rt"`
	MinRT         int       `gorm:"not null;default:0" json:"min_rt"`
	MaxRT         int       `gorm:"not null;default:0" json:"max_rt"`
	SuccessCount  int64     `gorm:"not null;default:0" json:"success_count"`
	ErrorCount    int64     `gorm:"not null;default:0" json:"error_count"`
	ErrorRate     float64   `gorm:"type:decimal(5,2);not null;default:0.00" json:"error_rate"`
	BytesReceived int64     `gorm:"not null;default:0" json:"bytes_received"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (Metric) TableName() string {
	return "metrics"
}

type Report struct {
	ID              uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskID          uint64    `gorm:"not null;unique" json:"task_id"`
	Name            string    `gorm:"size:200;not null" json:"name"`
	TotalRequests   int64     `gorm:"not null;default:0" json:"total_requests"`
	SuccessRequests int64     `gorm:"not null;default:0" json:"success_requests"`
	FailedRequests  int64     `gorm:"not null;default:0" json:"failed_requests"`
	ErrorRate       float64   `gorm:"type:decimal(5,2);not null;default:0.00" json:"error_rate"`
	AvgQPS          float64   `gorm:"type:decimal(10,2);not null;default:0.00" json:"avg_qps"`
	PeakQPS         int       `gorm:"not null;default:0" json:"peak_qps"`
	AvgRT           int       `gorm:"not null;default:0" json:"avg_rt"`
	MinRT           int       `gorm:"not null;default:0" json:"min_rt"`
	MaxRT           int       `gorm:"not null;default:0" json:"max_rt"`
	P50RT           int       `gorm:"not null;default:0" json:"p50_rt"`
	P95RT           int       `gorm:"not null;default:0" json:"p95_rt"`
	P99RT           int       `gorm:"not null;default:0" json:"p99_rt"`
	TotalDuration   int       `gorm:"not null;default:0" json:"total_duration"`
	BytesTotal      int64     `gorm:"not null;default:0" json:"bytes_total"`
	Summary         string    `gorm:"type:text" json:"summary"`
	DetailData      string    `gorm:"type:mediumtext" json:"detail_data"`
	Status          int8      `gorm:"not null;default:1" json:"status"`
	CreatedBy       uint64    `gorm:"not null" json:"created_by"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (Report) TableName() string {
	return "reports"
}

type Baseline struct {
	ID              uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name            string    `gorm:"size:100;not null" json:"name"`
	TargetID        uint64    `gorm:"not null" json:"target_id"`
	Path            string    `gorm:"size:255;not null" json:"path"`
	Method          string    `gorm:"size:10;not null" json:"method"`
	ReportID        uint64    `gorm:"not null" json:"report_id"`
	BaselineData    string    `gorm:"type:text;not null" json:"baseline_data"`
	ThresholdQPS    *float64  `gorm:"type:decimal(5,2)" json:"threshold_qps"`
	ThresholdRTP95  *int      `json:"threshold_rt_p95"`
	ThresholdErrRate *float64 `gorm:"type:decimal(5,2)" json:"threshold_error_rate"`
	IsDefault       int8      `gorm:"not null;default:0" json:"is_default"`
	Description     string    `gorm:"type:text" json:"description"`
	CreatedBy       uint64    `gorm:"not null" json:"created_by"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Baseline) TableName() string {
	return "baselines"
}

type Comparison struct {
	ID             uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name           string    `gorm:"size:200;not null" json:"name"`
	BaselineID     uint64    `gorm:"not null" json:"baseline_id"`
	ReportID       uint64    `gorm:"not null" json:"report_id"`
	ComparisonData string    `gorm:"type:text;not null" json:"comparison_data"`
	HasAlarm       int8      `gorm:"not null;default:0" json:"has_alarm"`
	AlarmDetails   string    `gorm:"type:text" json:"alarm_details"`
	CreatedBy      uint64    `gorm:"not null" json:"created_by"`
	CreatedAt      time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (Comparison) TableName() string {
	return "comparisons"
}

type Alarm struct {
	ID            uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskID        *uint64    `json:"task_id"`
	ReportID      *uint64    `json:"report_id"`
	BaselineID    *uint64    `json:"baseline_id"`
	ComparisonID  *uint64    `json:"comparison_id"`
	Type          string     `gorm:"size:50;not null" json:"type"`
	Level         int8       `gorm:"not null;default:1" json:"level"`
	Metric        string     `gorm:"size:50;not null" json:"metric"`
	BaselineValue *float64   `gorm:"type:decimal(15,2)" json:"baseline_value"`
	CurrentValue  float64    `gorm:"type:decimal(15,2);not null" json:"current_value"`
	Threshold     *float64   `gorm:"type:decimal(10,2)" json:"threshold"`
	Message       string     `gorm:"size:500;not null" json:"message"`
	Status        int8       `gorm:"not null;default:0" json:"status"`
	HandledBy     *uint64    `json:"handled_by"`
	HandledAt     *time.Time `json:"handled_at"`
	CreatedAt     time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (Alarm) TableName() string {
	return "alarms"
}
