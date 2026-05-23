package models

import "time"

type QuizQuestion struct {
	ID           uint64    `gorm:"primaryKey;column:id" json:"id"`
	LessonID     uint64    `gorm:"index:idx_lesson_id;not null;column:lesson_id" json:"lesson_id"`
	CourseID     uint64    `gorm:"index:idx_course_id;not null;column:course_id" json:"course_id"`
	QuestionType uint8     `gorm:"default:1;not null;column:question_type" json:"question_type"`
	Content      string    `gorm:"type:text;not null;column:content" json:"content"`
	Score        uint      `gorm:"default:10;not null;column:score" json:"score"`
	SortOrder    uint      `gorm:"default:0;not null;column:sort_order" json:"sort_order"`
	Status       uint8     `gorm:"default:1;not null;column:status" json:"status"`
	CreatedAt    time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (QuizQuestion) TableName() string { return "quiz_questions" }

type QuizOption struct {
	ID            uint64    `gorm:"primaryKey;column:id" json:"id"`
	QuestionID    uint64    `gorm:"index:idx_question_id;not null;column:question_id" json:"question_id"`
	OptionLabel   string    `gorm:"size:10;not null;column:option_label" json:"option_label"`
	OptionContent string    `gorm:"size:500;not null;column:option_content" json:"option_content"`
	IsCorrect     bool      `gorm:"default:false;not null;column:is_correct" json:"is_correct"`
	SortOrder     uint      `gorm:"default:0;not null;column:sort_order" json:"sort_order"`
	CreatedAt     time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt     time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (QuizOption) TableName() string { return "quiz_options" }

type QuizRecord struct {
	ID             uint64    `gorm:"primaryKey;column:id" json:"id"`
	UserID         uint64    `gorm:"index:idx_user_lesson;index:idx_user_course;not null;column:user_id" json:"user_id"`
	CourseID       uint64    `gorm:"index:idx_user_course;not null;column:course_id" json:"course_id"`
	LessonID       uint64    `gorm:"index:idx_user_lesson;not null;column:lesson_id" json:"lesson_id"`
	AttemptCount   uint      `gorm:"default:1;not null;column:attempt_count" json:"attempt_count"`
	TotalScore     uint      `gorm:"default:0;not null;column:total_score" json:"total_score"`
	TotalQuestions uint      `gorm:"default:0;not null;column:total_questions" json:"total_questions"`
	CorrectCount   uint      `gorm:"default:0;not null;column:correct_count" json:"correct_count"`
	IsPassed       bool      `gorm:"default:false;not null;index:idx_is_passed;column:is_passed" json:"is_passed"`
	TimeSpent      uint      `gorm:"default:0;not null;column:time_spent" json:"time_spent"`
	SubmittedAt    time.Time `gorm:"column:submitted_at" json:"submitted_at"`
	CreatedAt      time.Time `gorm:"column:created_at" json:"created_at"`
}

func (QuizRecord) TableName() string { return "quiz_records" }

type QuizAnswer struct {
	ID            uint64    `gorm:"primaryKey;column:id" json:"id"`
	RecordID      uint64    `gorm:"index:idx_record_id;not null;column:record_id" json:"record_id"`
	QuestionID    uint64    `gorm:"index:idx_question_id;not null;column:question_id" json:"question_id"`
	UserAnswer    string    `gorm:"size:255;column:user_answer" json:"user_answer"`
	CorrectAnswer string    `gorm:"size:255;column:correct_answer" json:"correct_answer"`
	IsCorrect     bool      `gorm:"default:false;not null;column:is_correct" json:"is_correct"`
	Score         uint      `gorm:"default:0;not null;column:score" json:"score"`
	CreatedAt     time.Time `gorm:"column:created_at" json:"created_at"`
}

func (QuizAnswer) TableName() string { return "quiz_answers" }
