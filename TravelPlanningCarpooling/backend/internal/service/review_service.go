package service

import (
	"carpooling/internal/model"
	"carpooling/pkg/database"
)

type ReviewService struct{}

func NewReviewService() *ReviewService {
	return &ReviewService{}
}

func (s *ReviewService) CreateReview(reviewerID uint64, req *model.CreateReviewRequest) (*model.Review, error) {
	review := &model.Review{
		OrderID:    req.OrderID,
		RideID:     req.RideID,
		ReviewerID: reviewerID,
		RevieweeID: req.RevieweeID,
		Rating:     req.Rating,
		Content:    req.Content,
		Tags:       req.Tags,
	}

	tx := database.GetDB().Begin()
	if err := tx.Create(review).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	creditDelta := 0
	if req.Rating >= 4 {
		creditDelta = 2
	} else if req.Rating == 3 {
		creditDelta = 0
	} else {
		creditDelta = -3
	}

	if creditDelta != 0 {
		if err := tx.Model(&model.User{}).Where("id = ?", req.RevieweeID).
			Update("credit_score", tx.Raw("credit_score + ?", creditDelta)).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	if err := tx.Model(&model.User{}).Where("id = ?", req.RevieweeID).
		Updates(map[string]interface{}{
			"total_rides":     tx.Raw("total_rides + 1"),
			"completed_rides": tx.Raw("completed_rides + 1"),
		}).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return review, nil
}

func (s *ReviewService) GetUserReviews(userID uint64, page, pageSize int) ([]model.Review, int64, error) {
	var list []model.Review
	var total int64

	db := database.GetDB().Model(&model.Review{}).Where("reviewee_id = ?", userID)

	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := db.Preload("Reviewer").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, 0, err
	}

	return list, total, nil
}
