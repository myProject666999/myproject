package services

import (
	"time"

	"mooc-platform/models"

	"gorm.io/gorm"
)

type QuizService struct {
	DB *gorm.DB
}

func NewQuizService(db *gorm.DB) *QuizService {
	return &QuizService{DB: db}
}

type AnswerItem struct {
	QuestionID uint64 `json:"question_id"`
	Answer     string `json:"answer"`
}

func (s *QuizService) GetQuestions(courseID uint64) ([]map[string]interface{}, error) {
	var questions []models.QuizQuestion
	if err := s.DB.Where("course_id = ?", courseID).Order("sort_order ASC").Find(&questions).Error; err != nil {
		return nil, err
	}

	result := make([]map[string]interface{}, 0, len(questions))
	for _, q := range questions {
		var options []models.QuizOption
		s.DB.Where("question_id = ?", q.ID).Order("sort_order ASC").Find(&options)

		opts := make([]map[string]interface{}, 0, len(options))
		for _, o := range options {
			opts = append(opts, map[string]interface{}{
				"id":      o.ID,
				"label":   o.OptionLabel,
				"content": o.OptionContent,
			})
		}

		result = append(result, map[string]interface{}{
			"id":            q.ID,
			"content":       q.Content,
			"question_type": q.QuestionType,
			"score":         q.Score,
			"options":       opts,
		})
	}
	return result, nil
}

func (s *QuizService) Submit(userID, courseID uint64, answers []AnswerItem) (map[string]interface{}, error) {
	var totalQuestions int64
	var correctCount uint
	var totalScore uint

	s.DB.Model(&models.QuizQuestion{}).Where("course_id = ?", courseID).Count(&totalQuestions)

	for _, a := range answers {
		var question models.QuizQuestion
		if err := s.DB.First(&question, a.QuestionID).Error; err != nil {
			continue
		}
		var correctOption models.QuizOption
		s.DB.Where("question_id = ? AND is_correct = ?", a.QuestionID, true).First(&correctOption)
		if a.Answer == correctOption.OptionLabel {
			correctCount++
			totalScore += question.Score
		}
	}

	record := models.QuizRecord{
		UserID:         userID,
		CourseID:       courseID,
		TotalQuestions: uint(totalQuestions),
		CorrectCount:   correctCount,
		TotalScore:     totalScore,
		IsPassed:       totalQuestions > 0 && totalScore*10/uint(totalQuestions) >= 6,
		SubmittedAt:    time.Now(),
		CreatedAt:      time.Now(),
	}
	s.DB.Create(&record)

	for _, a := range answers {
		var question models.QuizQuestion
		if err := s.DB.First(&question, a.QuestionID).Error; err != nil {
			continue
		}
		var correctOption models.QuizOption
		s.DB.Where("question_id = ? AND is_correct = ?", a.QuestionID, true).First(&correctOption)
		s.DB.Create(&models.QuizAnswer{
			RecordID:      record.ID,
			QuestionID:    a.QuestionID,
			UserAnswer:    a.Answer,
			CorrectAnswer: correctOption.OptionLabel,
			IsCorrect:     a.Answer == correctOption.OptionLabel,
			Score:         question.Score,
		})
	}

	return map[string]interface{}{
		"total_questions": totalQuestions,
		"correct_count":   correctCount,
		"total_score":     totalScore,
		"is_passed":       record.IsPassed,
		"record_id":       record.ID,
	}, nil
}

func (s *QuizService) GetScore(userID, courseID uint64) (*models.QuizRecord, error) {
	var record models.QuizRecord
	err := s.DB.Where("user_id = ? AND course_id = ?", userID, courseID).
		Order("submitted_at DESC").First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

func (s *QuizService) GetMyScores(userID uint64) ([]models.QuizRecord, error) {
	var list []models.QuizRecord
	err := s.DB.Where("user_id = ?", userID).Order("submitted_at DESC").Find(&list).Error
	return list, err
}
