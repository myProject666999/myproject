package services

import (
	"errors"
	"time"

	"mooc-platform/models"

	"gorm.io/gorm"
)

type ProgressService struct {
	DB *gorm.DB
}

func NewProgressService(db *gorm.DB) *ProgressService {
	return &ProgressService{DB: db}
}

func (s *ProgressService) Report(userID, courseID, lessonID uint64, position, totalWatchTime uint, completed bool) (*models.LearningProgress, error) {
	var progress models.LearningProgress
	err := s.DB.Where("user_id = ? AND course_id = ? AND lesson_id = ?", userID, courseID, lessonID).
		First(&progress).Error

	now := time.Now()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		progress = models.LearningProgress{
			UserID:         userID,
			CourseID:       courseID,
			LessonID:       lessonID,
			Progress:       0,
			LastPosition:   position,
			TotalWatchTime: totalWatchTime,
			IsCompleted:    completed,
			LastWatchAt:    &now,
			CreatedAt:      now,
			UpdatedAt:      now,
		}
		if err := s.DB.Create(&progress).Error; err != nil {
			return nil, err
		}
		return &progress, nil
	}
	if err != nil {
		return nil, err
	}

	progress.LastPosition = position
	progress.TotalWatchTime = totalWatchTime
	progress.IsCompleted = completed
	progress.LastWatchAt = &now
	progress.UpdatedAt = now

	if err := s.DB.Save(&progress).Error; err != nil {
		return nil, err
	}
	return &progress, nil
}

func (s *ProgressService) GetCourseProgress(userID, courseID uint64) (map[string]interface{}, error) {
	var list []models.LearningProgress
	if err := s.DB.Where("user_id = ? AND course_id = ?", userID, courseID).Find(&list).Error; err != nil {
		return nil, err
	}

	total := len(list)
	completed := 0
	for _, p := range list {
		if p.IsCompleted {
			completed++
		}
	}

	progressRate := 0
	if total > 0 {
		progressRate = completed * 100 / total
	}

	return map[string]interface{}{
		"total":        total,
		"completed":    completed,
		"progress":     progressRate,
		"list":         list,
	}, nil
}

func (s *ProgressService) GetMyCourses(userID uint64, page, size int) ([]map[string]interface{}, int64, error) {
	var enrollments []models.Enrollment
	var total int64

	db := s.DB.Model(&models.Enrollment{}).Where("user_id = ?", userID)
	db.Count(&total)
	if err := db.Order("created_at DESC").Offset((page - 1) * size).Limit(size).Find(&enrollments).Error; err != nil {
		return nil, 0, err
	}

	result := make([]map[string]interface{}, 0, len(enrollments))
	for _, e := range enrollments {
		result = append(result, map[string]interface{}{
			"course_id":    e.CourseID,
			"enrolled_at":  e.EnrolledAt,
			"payment_status": e.PaymentStatus,
		})
	}
	return result, total, nil
}

func (s *ProgressService) GetLessonProgress(userID, courseID, lessonID uint64) (*models.LearningProgress, error) {
	var progress models.LearningProgress
	err := s.DB.Where("user_id = ? AND course_id = ? AND lesson_id = ?", userID, courseID, lessonID).
		First(&progress).Error
	if err != nil {
		return nil, err
	}
	return &progress, nil
}

func (s *ProgressService) GetCourseStats(courseID, teacherID uint64) (map[string]interface{}, error) {
	var course models.Course
	if err := s.DB.Where("id = ? AND teacher_id = ?", courseID, teacherID).First(&course).Error; err != nil {
		return nil, err
	}

	var enrollmentCount int64
	s.DB.Model(&models.Enrollment{}).Where("course_id = ?", courseID).Count(&enrollmentCount)

	var completedCount int64
	s.DB.Model(&models.Enrollment{}).Where("course_id = ? AND completed_at IS NOT NULL", courseID).Count(&completedCount)

	return map[string]interface{}{
		"course_id":       courseID,
		"student_count":   course.StudentCount,
		"enrollment":      enrollmentCount,
		"completed":       completedCount,
		"rating_avg":      course.RatingAvg,
		"rating_count":    course.RatingCount,
	}, nil
}
