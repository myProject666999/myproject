package models

import "time"

type ReplenishmentTask struct {
	BaseModel
	TaskNo       string     `gorm:"column:task_no;size:64;uniqueIndex;not null" json:"task_no"`
	ReplenisherID *uint64   `gorm:"column:replenisher_id;index" json:"replenisher_id"`
	Area         string     `gorm:"column:area;size:64;index;not null" json:"area"`
	ContainerCount int      `gorm:"column:container_count;default:0" json:"container_count"`
	ProductCount   int      `gorm:"column:product_count;default:0" json:"product_count"`
	TotalQuantity  int      `gorm:"column:total_quantity;default:0" json:"total_quantity"`
	Status       int8       `gorm:"column:status;default:0;index" json:"status"`
	PlannedTime  *time.Time `gorm:"column:planned_time" json:"planned_time"`
	StartTime    *time.Time `gorm:"column:start_time" json:"start_time"`
	FinishTime   *time.Time `gorm:"column:finish_time" json:"finish_time"`
	Remark       string     `gorm:"column:remark;size:512" json:"remark"`

	Replenisher *Replenisher `gorm:"foreignKey:ReplenisherID" json:"replenisher,omitempty"`
	Items       []ReplenishmentTaskItem `gorm:"foreignKey:TaskID" json:"items,omitempty"`
}

func (ReplenishmentTask) TableName() string {
	return "replenishment_tasks"
}

type ReplenishmentTaskItem struct {
	BaseModel
	TaskID          uint64    `gorm:"column:task_id;uniqueIndex:uk_idempotent_key,priority:1;index;not null" json:"task_id"`
	ContainerID     uint64    `gorm:"column:container_id;uniqueIndex:uk_idempotent_key,priority:2;index;not null" json:"container_id"`
	ProductID       uint64    `gorm:"column:product_id;uniqueIndex:uk_idempotent_key,priority:3;index;not null" json:"product_id"`
	PlannedQuantity int       `gorm:"column:planned_quantity;not null" json:"planned_quantity"`
	ActualQuantity  *int      `gorm:"column:actual_quantity" json:"actual_quantity"`
	Status          int8      `gorm:"column:status;default:0" json:"status"`
	IdempotentKey   string    `gorm:"column:idempotent_key;size:128;uniqueIndex;not null" json:"idempotent_key"`

	Container *Container `gorm:"foreignKey:ContainerID" json:"container,omitempty"`
	Product   *Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

func (ReplenishmentTaskItem) TableName() string {
	return "replenishment_task_items"
}

type ReplenishmentTaskQuery struct {
	Page          int     `form:"page" json:"page"`
	PageSize      int     `form:"page_size" json:"page_size"`
	TaskNo        string  `form:"task_no" json:"task_no"`
	ReplenisherID *uint64 `form:"replenisher_id" json:"replenisher_id"`
	Area          string  `form:"area" json:"area"`
	Status        *int8   `form:"status" json:"status"`
}

type ReplenishmentTaskCreate struct {
	Area        string     `json:"area" binding:"required"`
	PlannedTime *time.Time `json:"planned_time"`
	Remark      string     `json:"remark"`
}

type ReplenishmentTaskDispatch struct {
	ReplenisherID uint64 `json:"replenisher_id" binding:"required"`
}

type ReplenishmentTaskExecute struct {
	TaskID uint64                        `json:"task_id" binding:"required"`
	Items  []ReplenishmentTaskItemExecute `json:"items" binding:"required,min=1"`
}

type ReplenishmentTaskItemExecute struct {
	ContainerID    uint64 `json:"container_id" binding:"required"`
	ProductID      uint64 `json:"product_id" binding:"required"`
	ActualQuantity int    `json:"actual_quantity" binding:"min=0"`
}

type GenerateTaskRequest struct {
	Area string `json:"area"`
}
