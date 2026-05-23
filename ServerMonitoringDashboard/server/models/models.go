package models

import "time"

type Node struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	IP        string    `json:"ip"`
	Group     string    `json:"group"`
	Token     string    `json:"token"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Metric struct {
	ID        int64     `json:"id"`
	NodeID    int64     `json:"node_id"`
	CPU       float64   `json:"cpu"`
	Memory    float64   `json:"memory"`
	Disk      float64   `json:"disk"`
	MemUsed   int64     `json:"mem_used"`
	MemTotal  int64     `json:"mem_total"`
	DiskUsed  int64     `json:"disk_used"`
	DiskTotal int64     `json:"disk_total"`
	CreatedAt time.Time `json:"created_at"`
}

type AlertRule struct {
	ID        int64     `json:"id"`
	NodeID    int64     `json:"node_id"`
	Metric    string    `json:"metric"`
	Condition string    `json:"condition"`
	Threshold float64   `json:"threshold"`
	Enabled   bool      `json:"enabled"`
	CreatedAt time.Time `json:"created_at"`
}

type AlertRecord struct {
	ID        int64     `json:"id"`
	NodeID    int64     `json:"node_id"`
	RuleID    int64     `json:"rule_id"`
	Metric    string    `json:"metric"`
	Value     float64   `json:"value"`
	Threshold float64   `json:"threshold"`
	Message   string    `json:"message"`
	Level     string    `json:"level"`
	CreatedAt time.Time `json:"created_at"`
}

type AgentReport struct {
	Token     string  `json:"token" binding:"required"`
	CPU       float64 `json:"cpu"`
	Memory    float64 `json:"memory"`
	Disk      float64 `json:"disk"`
	MemUsed   int64   `json:"mem_used"`
	MemTotal  int64   `json:"mem_total"`
	DiskUsed  int64   `json:"disk_used"`
	DiskTotal int64   `json:"disk_total"`
}
