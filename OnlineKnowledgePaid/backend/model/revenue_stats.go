package model

import "time"

type RevenueStats struct {
	ID                   uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	AuthorID             uint64    `gorm:"not null;uniqueIndex:idx_author_column_date" json:"author_id"`
	ColumnID             uint64    `gorm:"not null;uniqueIndex:idx_author_column_date" json:"column_id"`
	TotalRevenue         float64   `gorm:"type:decimal(12,2);not null;default:0" json:"total_revenue"`
	SubscriberCount      int       `gorm:"not null;default:0" json:"subscriber_count"`
	TodayRevenue         float64   `gorm:"type:decimal(10,2);not null;default:0" json:"today_revenue"`
	TodayNewSubscribers  int       `gorm:"not null;default:0" json:"today_new_subscribers"`
	StatsDate            time.Time `gorm:"type:date;not null;uniqueIndex:idx_author_column_date" json:"stats_date"`
	CreatedAt            time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt            time.Time `gorm:"autoUpdateTime" json:"updated_at"`
	Author               *User     `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
	Column               *Column   `gorm:"foreignKey:ColumnID" json:"column,omitempty"`
}

func (RevenueStats) TableName() string {
	return "revenue_stats"
}
