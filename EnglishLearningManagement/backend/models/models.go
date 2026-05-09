package models

import (
	"time"
)

type User struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Email        string    `json:"email" gorm:"uniqueIndex;not null"`
	Password     string    `json:"-" gorm:"not null"`
	Name         string    `json:"name"`
	Role         string    `json:"role" gorm:"default:user"`
	IsActive     bool      `json:"is_active" gorm:"default:false"`
	ActivationToken string  `json:"-" gorm:"unique"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Announcement struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title" gorm:"not null"`
	Content   string    `json:"content" gorm:"not null"`
	AuthorID  uint      `json:"author_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type DailySentence struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	Sentence    string `json:"sentence" gorm:"not null"`
	Translation string `json:"translation" gorm:"not null"`
	ImageURL    string `json:"image_url"`
	Date        string `json:"date" gorm:"uniqueIndex"`
}

type Word struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	Word        string `json:"word" gorm:"uniqueIndex;not null"`
	Meaning     string `json:"meaning" gorm:"not null"`
	Level       string `json:"level" gorm:"not null"`
	Example     string `json:"example"`
	ExampleCN   string `json:"example_cn"`
	Pronunciation string `json:"pronunciation"`
}

type UserWord struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"index:user_word_idx,unique"`
	WordID    uint      `json:"word_id" gorm:"index:user_word_idx,unique"`
	IsLearned bool      `json:"is_learned" gorm:"default:false"`
	IsFavorited bool    `json:"is_favorited" gorm:"default:false"`
	CorrectCount int    `json:"correct_count" gorm:"default:0"`
	WrongCount int      `json:"wrong_count" gorm:"default:0"`
	LastLearnedAt time.Time `json:"last_learned_at"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ListeningMaterial struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Level       string    `json:"level" gorm:"not null"`
	Year        int       `json:"year"`
	AudioURL    string    `json:"audio_url"`
	Transcript  string    `json:"transcript"`
	Questions   string    `json:"questions"`
	Answers     string    `json:"answers"`
	CreatedAt   time.Time `json:"created_at"`
}

type Book struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	Title       string `json:"title" gorm:"not null"`
	Author      string `json:"author"`
	Description string `json:"description"`
	Level       string `json:"level"`
	CoverURL    string `json:"cover_url"`
	Content     string `json:"content" gorm:"type:text"`
}

type UserBookProgress struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id" gorm:"index:user_book_idx,unique"`
	BookID      uint      `json:"book_id" gorm:"index:user_book_idx,unique"`
	CurrentPage int       `json:"current_page" gorm:"default:0"`
	IsCompleted bool      `json:"is_completed" gorm:"default:false"`
	UpdatedAt   time.Time `json:"updated_at"`
}
