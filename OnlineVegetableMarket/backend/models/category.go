package models

import (
	"time"
)

type Category struct {
	ID        uint64    `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"column:name;size:50;uniqueIndex;not null" json:"name"`
	Icon      string    `gorm:"column:icon;size:255" json:"icon"`
	Sort      int       `gorm:"column:sort;default:0" json:"sort"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

func (Category) TableName() string {
	return "categories"
}
