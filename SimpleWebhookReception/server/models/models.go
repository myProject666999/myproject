package models

import (
	"time"

	"gorm.io/gorm"
)

type Endpoint struct {
	ID          string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	Token       string         `gorm:"type:varchar(255);uniqueIndex" json:"token"`
	Active      bool           `gorm:"default:true" json:"active"`
	Retention   int            `gorm:"default:7" json:"retention"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Endpoint) TableName() string {
	return "endpoints"
}

type WebhookRequest struct {
	ID           string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	EndpointID   string         `gorm:"type:varchar(36);index;not null" json:"endpoint_id"`
	Method       string         `gorm:"type:varchar(16);not null" json:"method"`
	Path         string         `gorm:"type:text" json:"path"`
	QueryParams  string         `gorm:"type:text" json:"query_params"`
	Headers      string         `gorm:"type:text" json:"headers"`
	Body         string         `gorm:"type:text" json:"body"`
	SourceIP     string         `gorm:"type:varchar(64)" json:"source_ip"`
	UserAgent    string         `gorm:"type:varchar(512)" json:"user_agent"`
	ReceivedAt   time.Time      `json:"received_at"`
	Forwarded    bool           `gorm:"default:false" json:"forwarded"`
	ForwardError string         `gorm:"type:text" json:"forward_error"`
	CreatedAt    time.Time      `json:"created_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (WebhookRequest) TableName() string {
	return "webhook_requests"
}

type ForwardRule struct {
	ID         string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	EndpointID string         `gorm:"type:varchar(36);index;not null" json:"endpoint_id"`
	Name       string         `gorm:"type:varchar(255);not null" json:"name"`
	TargetURL  string         `gorm:"type:text;not null" json:"target_url"`
	Method     string         `gorm:"type:varchar(16);default:'POST'" json:"method"`
	Headers    string         `gorm:"type:text" json:"headers"`
	Active     bool           `gorm:"default:true" json:"active"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

func (ForwardRule) TableName() string {
	return "forward_rules"
}

type ForwardLog struct {
	ID           string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	RequestID    string         `gorm:"type:varchar(36);index;not null" json:"request_id"`
	RuleID       string         `gorm:"type:varchar(36);index;not null" json:"rule_id"`
	TargetURL    string         `gorm:"type:text" json:"target_url"`
	StatusCode   int            `json:"status_code"`
	ResponseBody string         `gorm:"type:text" json:"response_body"`
	Error        string         `gorm:"type:text" json:"error"`
	Success      bool           `json:"success"`
	ForwardedAt  time.Time      `json:"forwarded_at"`
}

func (ForwardLog) TableName() string {
	return "forward_logs"
}
