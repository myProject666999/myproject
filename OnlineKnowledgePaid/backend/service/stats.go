package service

import (
	"time"

	"gorm.io/gorm"

	"online-knowledge-paid/model"
)

type StatsService struct{}

func (s *StatsService) GetRevenueStats(db *gorm.DB, authorID uint64, startDate, endDate string) ([]model.RevenueStats, error) {
	var stats []model.RevenueStats

	start, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		return nil, err
	}
	end, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		return nil, err
	}

	if err := db.Preload("Column").
		Where("author_id = ? AND stats_date >= ? AND stats_date <= ?", authorID, start, end).
		Order("stats_date ASC").
		Find(&stats).Error; err != nil {
		return nil, err
	}
	return stats, nil
}

func (s *StatsService) GetAuthorOverview(db *gorm.DB, authorID uint64) (map[string]interface{}, error) {
	var columns []model.Column
	if err := db.Where("author_id = ?", authorID).Find(&columns).Error; err != nil {
		return nil, err
	}

	var totalArticles int
	var totalViews int
	var totalSubscribers int
	for _, col := range columns {
		totalArticles += col.ArticleCount
		totalViews += col.ViewCount
		totalSubscribers += col.SubscriberCount
	}

	var totalRevenue float64
	db.Model(&model.RevenueStats{}).Where("author_id = ?", authorID).Select("COALESCE(SUM(total_revenue), 0)").Scan(&totalRevenue)

	return map[string]interface{}{
		"total_revenue":     totalRevenue,
		"total_subscribers": totalSubscribers,
		"total_articles":    totalArticles,
		"total_views":       totalViews,
	}, nil
}

func (s *StatsService) GetColumnStats(db *gorm.DB, columnID uint64) (map[string]interface{}, error) {
	var column model.Column
	if err := db.First(&column, columnID).Error; err != nil {
		return nil, err
	}

	var revenue float64
	db.Model(&model.RevenueStats{}).Where("column_id = ?", columnID).Select("COALESCE(SUM(total_revenue), 0)").Scan(&revenue)

	return map[string]interface{}{
		"id":              column.ID,
		"title":           column.Title,
		"description":     column.Description,
		"cover_image":     column.CoverImage,
		"price":           column.Price,
		"is_free":         column.IsFree,
		"article_count":   column.ArticleCount,
		"subscriber_count": column.SubscriberCount,
		"view_count":      column.ViewCount,
		"status":          column.Status,
		"created_at":      column.CreatedAt,
		"revenue":         revenue,
	}, nil
}