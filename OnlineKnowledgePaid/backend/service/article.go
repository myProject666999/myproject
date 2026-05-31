package service

import (
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"

	"online-knowledge-paid/model"
	redisclient "online-knowledge-paid/pkg/redis"
)

type ArticleService struct{}

func (s *ArticleService) CreateArticle(db *gorm.DB, article *model.Article) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(article).Error; err != nil {
			return err
		}
		if err := tx.Model(&model.Column{}).Where("id = ?", article.ColumnID).UpdateColumn("article_count", gorm.Expr("article_count + ?", 1)).Error; err != nil {
			return err
		}
		return nil
	})
}

func (s *ArticleService) GetArticlesByColumn(db *gorm.DB, columnID uint64, page, pageSize int) ([]model.Article, int64, error) {
	var articles []model.Article
	var total int64

	offset := (page - 1) * pageSize

	db.Model(&model.Article{}).Where("column_id = ?", columnID).Count(&total)

	if err := db.Select("id, title, summary, is_free, author_id, view_count, like_count, comment_count, created_at, column_id").
		Where("column_id = ?", columnID).
		Offset(offset).Limit(pageSize).
		Order("sort_order ASC, created_at DESC").
		Find(&articles).Error; err != nil {
		return nil, 0, err
	}
	return articles, total, nil
}

func (s *ArticleService) GetArticleByID(db *gorm.DB, id uint64) (*model.Article, error) {
	var article model.Article
	if err := db.Preload("Author").Preload("Column.Author").First(&article, id).Error; err != nil {
		return nil, err
	}

	client := redisclient.GetClient()
	if client != nil {
		key := fmt.Sprintf("article:view:%d", id)
		_ = client.Incr(context.Background(), key).Err()
		_ = client.Expire(context.Background(), key, 24*time.Hour).Err()
	}

	if err := db.Model(&article).UpdateColumn("view_count", gorm.Expr("view_count + ?", 1)).Error; err != nil {
		return nil, err
	}
	return &article, nil
}

func (s *ArticleService) UpdateArticle(db *gorm.DB, article *model.Article) error {
	return db.Save(article).Error
}

func (s *ArticleService) DeleteArticle(db *gorm.DB, id uint64) error {
	return db.Transaction(func(tx *gorm.DB) error {
		var article model.Article
		if err := tx.First(&article, id).Error; err != nil {
			return err
		}
		if err := tx.Delete(&article).Error; err != nil {
			return err
		}
		if err := tx.Model(&model.Column{}).Where("id = ?", article.ColumnID).UpdateColumn("article_count", gorm.Expr("article_count - ?", 1)).Error; err != nil {
			return err
		}
		return nil
	})
}

func (s *ArticleService) GetArticlesByAuthor(db *gorm.DB, authorID uint64) ([]model.Article, error) {
	var articles []model.Article
	if err := db.Where("author_id = ?", authorID).Order("created_at DESC").Find(&articles).Error; err != nil {
		return nil, err
	}
	return articles, nil
}
