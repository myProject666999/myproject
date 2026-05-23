package services

import (
	"mooc-platform/models"

	"gorm.io/gorm"
)

type CourseService struct {
	DB *gorm.DB
}

func NewCourseService(db *gorm.DB) *CourseService {
	return &CourseService{DB: db}
}

func (s *CourseService) Create(course *models.Course) error {
	return s.DB.Create(course).Error
}

func (s *CourseService) GetByID(id uint64) (*models.Course, error) {
	var course models.Course
	err := s.DB.First(&course, id).Error
	if err != nil {
		return nil, err
	}
	return &course, nil
}

func (s *CourseService) Update(course *models.Course) error {
	return s.DB.Save(course).Error
}

func (s *CourseService) Delete(id uint64) error {
	return s.DB.Delete(&models.Course{}, id).Error
}

func (s *CourseService) List(page, size int, keyword, categoryID, level, teacherID string) ([]models.Course, int64, error) {
	var list []models.Course
	var total int64

	db := s.DB.Model(&models.Course{}).Where("status = 1")
	if keyword != "" {
		db = db.Where("title LIKE ?", "%"+keyword+"%")
	}
	if categoryID != "" {
		db = db.Where("category_id = ?", categoryID)
	}
	if level != "" {
		db = db.Where("level = ?", level)
	}
	if teacherID != "" {
		db = db.Where("teacher_id = ?", teacherID)
	}

	db.Count(&total)
	if err := db.Order("created_at DESC").Offset((page - 1) * size).Limit(size).Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

func (s *CourseService) ListByTeacher(teacherID uint64, page, size int, status string) ([]models.Course, int64, error) {
	var list []models.Course
	var total int64

	db := s.DB.Model(&models.Course{}).Where("teacher_id = ?", teacherID)
	if status != "" {
		db = db.Where("status = ?", status)
	}

	db.Count(&total)
	if err := db.Order("created_at DESC").Offset((page - 1) * size).Limit(size).Find(&list).Error; err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

func (s *CourseService) HotCourses(limit int) ([]models.Course, error) {
	var list []models.Course
	err := s.DB.Where("status = 1").Order("rating_avg DESC").Limit(limit).Find(&list).Error
	return list, err
}

func (s *CourseService) Publish(id, teacherID uint64) error {
	return s.DB.Model(&models.Course{}).
		Where("id = ? AND teacher_id = ?", id, teacherID).
		Updates(map[string]interface{}{"status": 1}).Error
}

func (s *CourseService) Offline(id, teacherID uint64) error {
	return s.DB.Model(&models.Course{}).
		Where("id = ? AND teacher_id = ?", id, teacherID).
		Updates(map[string]interface{}{"status": 0}).Error
}
