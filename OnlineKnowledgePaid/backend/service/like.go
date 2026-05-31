package service

import (
	"errors"

	"gorm.io/gorm"

	"online-knowledge-paid/model"
)

type LikeService struct{}

func (s *LikeService) ToggleLike(db *gorm.DB, userID, articleID uint64) (bool, error) {
	var existing model.Like
	err := db.Where("user_id = ? AND article_id = ?", userID, articleID).First(&existing).Error

	if err == nil {
		if err := db.Delete(&existing).Error; err != nil {
			return false, err
		}
		if err := db.Model(&model.Article{}).Where("id = ?", articleID).UpdateColumn("like_count", gorm.Expr("like_count - ?", 1)).Error; err != nil {
			return false, err
		}
		return false, nil
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, err
	}

	like := &model.Like{
		UserID:    userID,
		ArticleID: articleID,
	}
	if err := db.Create(like).Error; err != nil {
		return false, err
	}
	if err := db.Model(&model.Article{}).Where("id = ?", articleID).UpdateColumn("like_count", gorm.Expr("like_count + ?", 1)).Error; err != nil {
		return false, err
	}
	return true, nil
}

func (s *LikeService) CheckLike(db *gorm.DB, userID, articleID uint64) (bool, error) {
	var like model.Like
	err := db.Where("user_id = ? AND article_id = ?", userID, articleID).First(&like).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (s *LikeService) GetLikeCount(db *gorm.DB, articleID uint64) (int64, error) {
	var count int64
	err := db.Model(&model.Like{}).Where("article_id = ?", articleID).Count(&count).Error
	return count, err
}