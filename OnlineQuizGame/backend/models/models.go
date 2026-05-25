package models

import (
	"time"
)

type User struct {
	ID         int64     `json:"id" gorm:"primaryKey"`
	Username   string    `json:"username" gorm:"uniqueIndex;size:50"`
	Nickname   string    `json:"nickname" gorm:"size:50"`
	Avatar     string    `json:"avatar" gorm:"size:255"`
	TotalScore int       `json:"totalScore" gorm:"default:0"`
	TotalGames int       `json:"totalGames" gorm:"default:0"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

func (User) TableName() string {
	return "users"
}

type Category struct {
	ID          int       `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"uniqueIndex;size:50"`
	Icon        string    `json:"icon" gorm:"size:255"`
	Description string    `json:"description" gorm:"size:255"`
	CreatedAt   time.Time `json:"createdAt"`
}

func (Category) TableName() string {
	return "categories"
}

type Question struct {
	ID            int64     `json:"id" gorm:"primaryKey"`
	CategoryID    int       `json:"categoryId" gorm:"index"`
	QuestionText  string    `json:"questionText" gorm:"type:text"`
	OptionA       string    `json:"optionA" gorm:"size:500"`
	OptionB       string    `json:"optionB" gorm:"size:500"`
	OptionC       string    `json:"optionC" gorm:"size:500"`
	OptionD       string    `json:"optionD" gorm:"size:500"`
	CorrectAnswer string    `json:"-" gorm:"size:1"`
	Explanation   string    `json:"explanation,omitempty" gorm:"type:text"`
	Difficulty    int       `json:"difficulty" gorm:"default:1"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

func (Question) TableName() string {
	return "questions"
}

type QuestionForClient struct {
	ID           int64  `json:"id"`
	CategoryID   int    `json:"categoryId"`
	QuestionText string `json:"questionText"`
	OptionA      string `json:"optionA"`
	OptionB      string `json:"optionB"`
	OptionC      string `json:"optionC"`
	OptionD      string `json:"optionD"`
	Difficulty   int    `json:"difficulty"`
}

type GameRecord struct {
	ID             int64      `json:"id" gorm:"primaryKey"`
	UserID         int64      `json:"userId" gorm:"index"`
	CategoryID     *int       `json:"categoryId,omitempty" gorm:"index"`
	TotalQuestions int        `json:"totalQuestions" gorm:"default:0"`
	CorrectCount   int        `json:"correctCount" gorm:"default:0"`
	Score          int        `json:"score" gorm:"default:0"`
	MaxCombo       int        `json:"maxCombo" gorm:"default:0"`
	StartTime      *time.Time `json:"startTime"`
	EndTime        *time.Time `json:"endTime"`
	CreatedAt      time.Time  `json:"createdAt"`
}

func (GameRecord) TableName() string {
	return "game_records"
}

type AnswerDetail struct {
	ID            int64     `json:"id" gorm:"primaryKey"`
	GameRecordID  int64     `json:"gameRecordId" gorm:"index"`
	QuestionID    int64     `json:"questionId" gorm:"index"`
	UserAnswer    *string   `json:"userAnswer,omitempty" gorm:"size:1"`
	IsCorrect     int       `json:"isCorrect" gorm:"default:0"`
	TimeSpent     int       `json:"timeSpent" gorm:"default:0"`
	CreatedAt     time.Time `json:"createdAt"`
}

func (AnswerDetail) TableName() string {
	return "answer_details"
}

type StartQuizRequest struct {
	Username   string `json:"username" binding:"required"`
	Nickname   string `json:"nickname" binding:"required"`
	CategoryID int    `json:"categoryId"`
	NumQuestions int  `json:"numQuestions" binding:"required,min=1,max=20"`
}

type SubmitAnswerRequest struct {
	GameID      int64  `json:"gameId" binding:"required"`
	QuestionID  int64  `json:"questionId" binding:"required"`
	UserAnswer  string `json:"userAnswer"`
	ClientTime  int64  `json:"clientTime"`
}

type APIResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type QuizSession struct {
	GameID      int64     `json:"gameId"`
	UserID      int64     `json:"userId"`
	QuestionID  int64     `json:"questionId"`
	StartTime   time.Time `json:"startTime"`
	ServerToken string    `json:"serverToken"`
}

type LeaderboardEntry struct {
	Rank       int    `json:"rank"`
	UserID     int64  `json:"userId"`
	Username   string `json:"username"`
	Nickname   string `json:"nickname"`
	Avatar     string `json:"avatar"`
	Score      int64  `json:"score"`
}
