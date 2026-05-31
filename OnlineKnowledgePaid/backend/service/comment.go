package service

import (
	"gorm.io/gorm"

	"online-knowledge-paid/model"
)

type CommentService struct{}

func (s *CommentService) CreateComment(db *gorm.DB, comment *model.Comment) error {
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(comment).Error; err != nil {
			return err
		}
		if err := tx.Model(&model.Article{}).Where("id = ?", comment.ArticleID).UpdateColumn("comment_count", gorm.Expr("comment_count + ?", 1)).Error; err != nil {
			return err
		}
		return nil
	})
}

func (s *CommentService) GetCommentsByArticle(db *gorm.DB, articleID uint64, page, pageSize int) ([]model.Comment, int64, error) {
	var comments []model.Comment
	var total int64

	offset := (page - 1) * pageSize

	db.Model(&model.Comment{}).Where("article_id = ? AND status = ?", articleID, 1).Count(&total)

	if err := db.Preload("User").
		Where("article_id = ? AND status = ?", articleID, 1).
		Offset(offset).Limit(pageSize).
		Order("created_at DESC").
		Find(&comments).Error; err != nil {
		return nil, 0, err
	}
	return comments, total, nil
}

func (s *CommentService) DeleteComment(db *gorm.DB, id uint64) error {
	return db.Transaction(func(tx *gorm.DB) error {
		var comment model.Comment
		if err := tx.First(&comment, id).Error; err != nil {
			return err
		}
		comment.Status = 0
		if err := tx.Save(&comment).Error; err != nil {
			return err
		}
		if err := tx.Model(&model.Article{}).Where("id = ?", comment.ArticleID).UpdateColumn("comment_count", gorm.Expr("comment_count - ?", 1)).Error; err != nil {
			return err
		}
		return nil
	})
}