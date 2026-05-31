package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type HTTPConfig struct {
	URL     string            `json:"url"`
	Method  string            `json:"method"`
	Headers map[string]string `json:"headers"`
	Body    string            `json:"body"`
	Timeout int               `json:"timeout"`
}

func (c HTTPConfig) Value() (driver.Value, error) {
	return json.Marshal(c)
}

func (c *HTTPConfig) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("failed to unmarshal HTTPConfig")
	}
	return json.Unmarshal(bytes, c)
}

type ScriptConfig struct {
	ScriptPath string   `json:"script_path"`
	Args       []string `json:"args"`
	Timeout    int      `json:"timeout"`
}

func (c ScriptConfig) Value() (driver.Value, error) {
	return json.Marshal(c)
}

func (c *ScriptConfig) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("failed to unmarshal ScriptConfig")
	}
	return json.Unmarshal(bytes, c)
}

type StringSlice []string

func (s StringSlice) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *StringSlice) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("failed to unmarshal StringSlice")
	}
	return json.Unmarshal(bytes, s)
}

type InspectionTask struct {
	ID              uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Name            string         `gorm:"size:100;not null" json:"name"`
	Description     string         `gorm:"type:text" json:"description"`
	Type            int8           `gorm:"not null" json:"type"`
	CronExpr        string         `gorm:"size:50;not null" json:"cron_expr"`
	Timeout         int            `gorm:"not null;default:30" json:"timeout"`
	RetryCount      int            `gorm:"not null;default:0" json:"retry_count"`
	RetryInterval   int            `gorm:"not null;default:5" json:"retry_interval"`
	HTTPConfig      *HTTPConfig    `gorm:"type:json" json:"http_config,omitempty"`
	ScriptConfig    *ScriptConfig  `gorm:"type:json" json:"script_config,omitempty"`
	AlertThreshold  int            `gorm:"not null;default:1" json:"alert_threshold"`
	NotifyChannels  StringSlice    `gorm:"type:json" json:"notify_channels"`
	Tags            string         `gorm:"size:255" json:"tags"`
	Status          int8           `gorm:"not null;default:1" json:"status"`
	CreatedBy       uint64         `gorm:"not null" json:"created_by"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
}

func (t *InspectionTask) TableName() string {
	return "inspection_tasks"
}

type InspectionResult struct {
	ID           uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	TaskID       uint64     `gorm:"not null" json:"task_id"`
	TaskName     string     `gorm:"size:100;not null" json:"task_name"`
	ExecutionID  string     `gorm:"size:64;not null" json:"execution_id"`
	Status       int8       `gorm:"not null" json:"status"`
	Duration     int        `json:"duration"`
	ResultData   map[string]interface{} `gorm:"type:json" json:"result_data"`
	ErrorMessage string     `gorm:"type:text" json:"error_message"`
	RetryTimes   int        `gorm:"not null;default:0" json:"retry_times"`
	Notified     int8       `gorm:"not null;default:0" json:"notified"`
	StartedAt    time.Time  `gorm:"not null" json:"started_at"`
	EndedAt      *time.Time `json:"ended_at"`
	CreatedAt    time.Time  `json:"created_at"`
}

func (r *InspectionResult) TableName() string {
	return "inspection_results"
}

type CreateTaskRequest struct {
	Name           string        `json:"name" binding:"required"`
	Description    string        `json:"description"`
	Type           int8          `json:"type" binding:"required,oneof=1 2"`
	CronExpr       string        `json:"cron_expr" binding:"required"`
	Timeout        int           `json:"timeout"`
	RetryCount     int           `json:"retry_count"`
	RetryInterval  int           `json:"retry_interval"`
	HTTPConfig     *HTTPConfig   `json:"http_config"`
	ScriptConfig   *ScriptConfig `json:"script_config"`
	AlertThreshold int           `json:"alert_threshold"`
	NotifyChannels StringSlice   `json:"notify_channels"`
	Tags           string        `json:"tags"`
	Status         int8          `json:"status"`
}

type TaskListRequest struct {
	Page     int    `form:"page,default=1"`
	PageSize int    `form:"page_size,default=10"`
	Status   int8   `form:"status"`
	Keyword  string `form:"keyword"`
}

type ResultListRequest struct {
	Page     int    `form:"page,default=1"`
	PageSize int    `form:"page_size,default=10"`
	TaskID   uint64 `form:"task_id"`
	Status   int8   `form:"status"`
	StartDate string `form:"start_date"`
	EndDate   string `form:"end_date"`
}
