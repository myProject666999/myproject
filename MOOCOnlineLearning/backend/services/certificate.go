package services

import (
	"errors"
	"time"

	"mooc-platform/models"

	"gorm.io/gorm"
)

type CertificateService struct {
	DB *gorm.DB
}

func NewCertificateService(db *gorm.DB) *CertificateService {
	return &CertificateService{DB: db}
}

func (s *CertificateService) Generate(userID, courseID uint64) (*models.Certificate, error) {
	var existing models.Certificate
	err := s.DB.Where("user_id = ? AND course_id = ?", userID, courseID).First(&existing).Error
	if err == nil {
		return &existing, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	var course models.Course
	if err := s.DB.First(&course, courseID).Error; err != nil {
		return nil, errors.New("课程不存在")
	}

	var user models.User
	if err := s.DB.First(&user, userID).Error; err != nil {
		return nil, errors.New("用户不存在")
	}

	var record models.QuizRecord
	s.DB.Where("user_id = ? AND course_id = ?", userID, courseID).Order("submitted_at DESC").First(&record)

	finalScore := float64(record.TotalScore)

	certNo := "CERT" + time.Now().Format("20060102150405")
	cert := models.Certificate{
		CertificateNo: certNo,
		UserID:        userID,
		CourseID:      courseID,
		Title:         course.Title + " 结业证书",
		CourseName:    course.Title,
		TeacherName:   "",
		FinalScore:    finalScore,
		IssuedAt:      time.Now(),
		CreatedAt:     time.Now(),
	}
	if err := s.DB.Create(&cert).Error; err != nil {
		return nil, err
	}
	return &cert, nil
}

func (s *CertificateService) GetByID(id uint64) (*models.Certificate, error) {
	var cert models.Certificate
	err := s.DB.First(&cert, id).Error
	if err != nil {
		return nil, err
	}
	return &cert, nil
}

func (s *CertificateService) ListByUser(userID uint64) ([]models.Certificate, error) {
	var list []models.Certificate
	err := s.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&list).Error
	return list, err
}

func (s *CertificateService) Verify(certNo string) (*models.Certificate, error) {
	var cert models.Certificate
	err := s.DB.Where("certificate_no = ?", certNo).First(&cert).Error
	if err != nil {
		return nil, err
	}
	return &cert, nil
}
