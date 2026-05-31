package model

import "time"

type RobotConfig struct {
	ID          uint64      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string      `gorm:"size:50;not null" json:"name"`
	Type        string      `gorm:"size:20;not null" json:"type"`
	WebhookURL  string      `gorm:"size:255;not null" json:"webhook_url"`
	Secret      string      `gorm:"size:255" json:"secret"`
	Token       string      `gorm:"size:255" json:"token"`
	AtMobiles   StringSlice `gorm:"type:json" json:"at_mobiles"`
	AtAll       int8        `gorm:"not null;default:0" json:"at_all"`
	IsDefault   int8        `gorm:"not null;default:0" json:"is_default"`
	Status      int8        `gorm:"not null;default:1" json:"status"`
	CreatedBy   uint64      `gorm:"not null" json:"created_by"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

func (r *RobotConfig) TableName() string {
	return "robot_configs"
}

type Plan struct {
	ID           uint64      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name           string      `gorm:"size:100;not null" json:"name"`
	Description    string      `gorm:"type:text" json:"description"`
	Command        string      `gorm:"size:100;not null;unique" json:"command"`
	Type           int8        `gorm:"not null" json:"type"`
	Config         map[string]interface{} `gorm:"type:json;not null" json:"config"`
	Timeout        int         `gorm:"not null;default:60" json:"timeout"`
	IdempotentKey  string      `gorm:"size:255" json:"idempotent_key"`
	AllowedRoles   StringSlice `gorm:"type:json" json:"allowed_roles"`
	AllowedUsers   []uint64    `gorm:"type:json" json:"allowed_users"`
	NeedApproval   int8        `gorm:"not null;default:0" json:"need_approval"`
	Status         int8        `gorm:"not null;default:1" json:"status"`
	CreatedBy      uint64      `gorm:"not null" json:"created_by"`
	CreatedAt      time.Time   `json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`
}

func (p *Plan) TableName() string {
	return "plans"
}

type CommandAudit struct {
	ID             uint64                 `gorm:"primaryKey;autoIncrement" json:"id"`
	Command        string                 `gorm:"size:255;not null" json:"command"`
	Params         map[string]interface{} `gorm:"type:json" json:"params"`
	UserID         uint64                 `gorm:"not null" json:"user_id"`
	Username       string                 `gorm:"size:50;not null" json:"username"`
	Channel        string                 `gorm:"size:50;not null" json:"channel"`
	ChannelUserID  string                 `gorm:"size:100" json:"channel_user_id"`
	PlanID         *uint64                `json:"plan_id"`
	PlanName       string                 `gorm:"size:100" json:"plan_name"`
	Status         int8                   `gorm:"not null" json:"status"`
	ResultData     map[string]interface{} `gorm:"type:json" json:"result_data"`
	ErrorMessage   string                 `gorm:"type:text" json:"error_message"`
	Duration       int                    `json:"duration"`
	IPAddress      string                 `gorm:"size:50" json:"ip_address"`
	UserAgent      string                 `gorm:"size:500" json:"user_agent"`
	StartedAt      time.Time              `gorm:"not null" json:"started_at"`
	EndedAt        *time.Time             `json:"ended_at"`
	CreatedAt      time.Time              `json:"created_at"`
}

func (a *CommandAudit) TableName() string {
	return "command_audit"
}

type DutyRotation struct {
	ID             uint64      `gorm:"primaryKey;autoIncrement" json:"id"`
	Name           string      `gorm:"size:100;not null" json:"name"`
	Type           int8        `gorm:"not null" json:"type"`
	UserIDs        []uint64    `gorm:"type:json;not null" json:"user_ids"`
	StartDate      time.Time   `gorm:"type:date;not null" json:"start_date"`
	EndDate        *time.Time  `gorm:"type:date" json:"end_date"`
	CurrentIndex   int         `gorm:"not null;default:0" json:"current_index"`
	NotifyTime     string      `gorm:"size:20" json:"notify_time"`
	NotifyChannels StringSlice `gorm:"type:json" json:"notify_channels"`
	Status         int8        `gorm:"not null;default:1" json:"status"`
	CreatedBy      uint64      `gorm:"not null" json:"created_by"`
	CreatedAt      time.Time   `json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`
}

func (d *DutyRotation) TableName() string {
	return "duty_rotations"
}

type DutyRecord struct {
	ID          uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	RotationID  uint64    `gorm:"not null" json:"rotation_id"`
	UserID       uint64    `gorm:"not null" json:"user_id"`
	Username     string    `gorm:"size:50;not null" json:"username"`
	DutyDate     time.Time `gorm:"type:date;not null" json:"duty_date"`
	DutyType     int8      `gorm:"not null" json:"duty_type"`
	Notified     int8      `gorm:"not null;default:0" json:"notified"`
	CreatedAt    time.Time `json:"created_at"`
}

func (d *DutyRecord) TableName() string {
	return "duty_records"
}

type Report struct {
	ID        uint64                 `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string                 `gorm:"size:100;not null" json:"name"`
	Type        int8                   `gorm:"not null" json:"type"`
	StartDate   time.Time              `gorm:"type:date;not null" json:"start_date"`
	EndDate     time.Time              `gorm:"type:date;not null" json:"end_date"`
	TaskIDs     []uint64             `gorm:"type:json" json:"task_ids"`
	Summary     map[string]interface{} `gorm:"type:json;not null" json:"summary"`
	Details     map[string]interface{} `gorm:"type:json" json:"details"`
	FilePath    string                 `gorm:"size:255" json:"file_path"`
	Status      int8                   `gorm:"not null;default:1" json:"status"`
	CreatedBy   uint64                 `gorm:"not null" json:"created_by"`
	CreatedAt   time.Time              `json:"created_at"`
}

func (r *Report) TableName() string {
	return "reports"
}

type CreateRobotRequest struct {
	Name        string      `json:"name" binding:"required"`
	Type        string      `json:"type" binding:"required"`
	WebhookURL  string      `json:"webhook_url" binding:"required"`
	Secret      string      `json:"secret"`
	Token       string      `json:"token"`
	AtMobiles   StringSlice `json:"at_mobiles"`
	AtAll       int8        `json:"at_all"`
	IsDefault   int8        `json:"is_default"`
	Status      int8        `json:"status"`
}

type ExecuteCommandRequest struct {
	Command string                 `json:"command" binding:"required"`
	Params  map[string]interface{} `json:"params"`
}

type CreatePlanRequest struct {
	Name          string                   `json:"name" binding:"required"`
	Description   string                   `json:"description"`
	Command       string                   `json:"command" binding:"required"`
	Type          int8                     `json:"type" binding:"required"`
	Config        map[string]interface{}   `json:"config" binding:"required"`
	Timeout       int                      `json:"timeout"`
	IdempotentKey string                  `json:"idempotent_key"`
	AllowedRoles  StringSlice              `json:"allowed_roles"`
	AllowedUsers  []uint64                 `json:"allowed_users"`
	NeedApproval  int8                     `json:"need_approval"`
	Status        int8                     `json:"status"`
}
