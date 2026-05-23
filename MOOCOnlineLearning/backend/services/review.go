package services

import (
	"errors"
	"time"

	"mooc-platform/models"

	"gorm.io/gorm"
)

type ReviewService struct {
	DB *gorm.DB
}

func NewReviewService(db *gorm.DB) *ReviewService {
	return &ReviewService{DB: db}
}

func (s *ReviewService) Create(userID, courseID uint64, rating uint8, content string, parentID uint64) (*models.CourseReview, error) {
	review := models.CourseReview{
		UserID:    userID,
		CourseID:  courseID,
		Rating:    rating,
		Content:   content,
		ParentID:  parentID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := s.DB.Create(&review).Error; err != nil {
		return nil, err
	}

	s.updateCourseRating(courseID)
	return &review, nil
}

func (s *ReviewService) ListByCourse(courseID uint64, page, size int) ([]models.CourseReview, int64, error) {
	var list []models.CourseReview
	var total int64

	db := s.DB.Model(&models.CourseReview{}).Where("course_id = ? AND parent_id = 0", courseID)
	db.Count(&total)
	if err := db.Order("created_at DESC").Offset((page - 1) * size).Limit(size).Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

func (s *ReviewService) GetStats(courseID uint64) (map[string]interface{}, error) {
	var total int64
	var avgRating float64

	s.DB.Model(&models.CourseReview{}).Where("course_id = ? AND status = 1", courseID).Count(&total)
	s.DB.Model(&models.CourseReview{}).Where("course_id = ? AND status = 1", courseID).
		Select("COALESCE(AVG(rating), 0)").Scan(&avgRating)

	return map[string]interface{}{
		"total":       total,
		"avg_rating": avgRating,
	}, nil
}

func (s *ReviewService) Update(id, userID uint64, rating uint8, content string) error {
	result := s.DB.Model(&models.CourseReview{}).
		Where("id = ? AND user_id = ?", id, userID).
		Updates(map[string]interface{}{
			"rating":     rating,
			"content":    content,
			"updated_at":  time.Now(),
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("无权更新")
	}

	var review models.CourseReview
	s.DB.First(&review, id)
	s.updateCourseRating(review.CourseID)
	return nil
}

func (s *ReviewService) Delete(id, userID uint64) error {
	result := s.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.CourseReview{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("无权删除")
	}
	return nil
}

func (s *ReviewService) ListByCourseForTeacher(courseID, teacherID uint64, page, size int) ([]models.CourseReview, int64, error) {
	var course models.Course
	if err := s.DB.Where("id = ? AND teacher_id = ?", courseID, teacherID).First(&course).Error; err != nil {
		return nil, 0, errors.New("无权访问")
	}
	return s.ListByCourse(courseID, page, size)
}

func (s *ReviewService) TeacherDelete(id, teacherID uint64) error {
	var review models.CourseReview
	if err := s.DB.First(&review, id).Error; err != nil {
		return err
	}
	var course models.Course
	if err := s.DB.Where("id = ? AND teacher_id = ?", review.CourseID, teacherID).First(&course).Error; err != nil {
		return errors.New("无权删除")
	}
	return s.DB.Delete(&review).Error
}

func (s *ReviewService) updateCourseRating(courseID uint64) {
	var total []map[string]interface{}
	s.DB.Raw(
		"SELECT COUNT(*) as rating_count, COALESCE(AVG(rating), 0) as rating_avg FROM course_reviews WHERE course_id = ? AND status = 1",
		courseID,
	).Scan(&total)

	var rc int64
	var avg float64
	if len(total) > 0 {
		if v, ok := total[0]["rating_count"].(int64); ok {
			rc = v
		}
		if v, ok := total[0]["rating_avg"].(float64); ok {
			avg = v
		}
	}

	s.DB.Model(&models.Course{}).Where("id = ?", courseID).Updates(map[string]interface{}{
		"rating_avg":   avg,
		"rating_count": rc,
	})
}
