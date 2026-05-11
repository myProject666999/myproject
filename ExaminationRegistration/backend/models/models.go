package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password  string         `json:"-" gorm:"size:255;not null"`
	Email     string         `json:"email" gorm:"size:100"`
	Phone     string         `json:"phone" gorm:"size:20"`
	Nickname  string         `json:"nickname" gorm:"size:50"`
	Avatar    string         `json:"avatar" gorm:"size:255"`
	Gender    int            `json:"gender" gorm:"default:0"`
	Birthday  *time.Time     `json:"birthday"`
	Address   string         `json:"address" gorm:"size:255"`
	Role      string         `json:"role" gorm:"size:20;default:user"`
	Status    int            `json:"status" gorm:"default:1"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type SchoolIntro struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"size:200;not null"`
	Content     string         `json:"content" gorm:"type:text"`
	Image       string         `json:"image" gorm:"size:255"`
	ViewCount   int            `json:"view_count" gorm:"default:0"`
	LikeCount   int            `json:"like_count" gorm:"default:0"`
	DislikeCount int           `json:"dislike_count" gorm:"default:0"`
	Sort        int            `json:"sort" gorm:"default:0"`
	Status      int            `json:"status" gorm:"default:1"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type IntroLike struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"index"`
	IntroID   uint      `json:"intro_id" gorm:"index"`
	CreatedAt time.Time `json:"created_at"`
}

type IntroDislike struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"index"`
	IntroID   uint      `json:"intro_id" gorm:"index"`
	CreatedAt time.Time `json:"created_at"`
}

type Favorite struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	UserID     uint      `json:"user_id" gorm:"index"`
	TargetType string    `json:"target_type" gorm:"size:50"`
	TargetID   uint      `json:"target_id" gorm:"index"`
	CreatedAt  time.Time `json:"created_at"`
}

type EnrollmentProject struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"size:200;not null"`
	Description string         `json:"description" gorm:"type:text"`
	Image       string         `json:"image" gorm:"size:255"`
	Price       float64        `json:"price" gorm:"type:decimal(10,2);default:0"`
	OriginalPrice float64     `json:"original_price" gorm:"type:decimal(10,2);default:0"`
	Category    string         `json:"category" gorm:"size:50"`
	Duration    string         `json:"duration" gorm:"size:100"`
	StartTime   *time.Time     `json:"start_time"`
	EndTime     *time.Time     `json:"end_time"`
	Status      int            `json:"status" gorm:"default:1"`
	Sort        int            `json:"sort" gorm:"default:0"`
	ViewCount   int            `json:"view_count" gorm:"default:0"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Cart struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"index"`
	ProjectID uint      `json:"project_id" gorm:"index"`
	Quantity  int       `json:"quantity" gorm:"default:1"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Order struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	OrderNo       string         `json:"order_no" gorm:"uniqueIndex;size:50"`
	UserID        uint           `json:"user_id" gorm:"index"`
	AddressID     uint           `json:"address_id"`
	TotalAmount   float64        `json:"total_amount" gorm:"type:decimal(10,2)"`
	Status        string         `json:"status" gorm:"size:20;default:pending"`
	PaymentMethod string         `json:"payment_method" gorm:"size:50"`
	PaymentTime   *time.Time     `json:"payment_time"`
	Remark        string         `json:"remark" gorm:"size:500"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}

type OrderItem struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	OrderID   uint      `json:"order_id" gorm:"index"`
	ProjectID uint      `json:"project_id"`
	ProjectName string   `json:"project_name" gorm:"size:200"`
	Price     float64   `json:"price" gorm:"type:decimal(10,2)"`
	Quantity  int       `json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
}

type Address struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id" gorm:"index"`
	Name        string         `json:"name" gorm:"size:50"`
	Phone       string         `json:"phone" gorm:"size:20"`
	Province    string         `json:"province" gorm:"size:50"`
	City        string         `json:"city" gorm:"size:50"`
	District    string         `json:"district" gorm:"size:50"`
	Detail      string         `json:"detail" gorm:"size:255"`
	IsDefault   int            `json:"is_default" gorm:"default:0"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type ExamPaper struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title" gorm:"size:200;not null"`
	Description string         `json:"description" gorm:"type:text"`
	Category    string         `json:"category" gorm:"size:50"`
	Duration    int            `json:"duration" gorm:"default:60"`
	TotalScore  int            `json:"total_score" gorm:"default:100"`
	PassScore   int            `json:"pass_score" gorm:"default:60"`
	Status      int            `json:"status" gorm:"default:1"`
	Sort        int            `json:"sort" gorm:"default:0"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Question struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	PaperID      uint           `json:"paper_id" gorm:"index"`
	QuestionType string         `json:"question_type" gorm:"size:20"`
	Content      string         `json:"content" gorm:"type:text"`
	Image        string         `json:"image" gorm:"size:255"`
	Answer       string         `json:"answer" gorm:"type:text"`
	Analysis     string         `json:"analysis" gorm:"type:text"`
	Score        int            `json:"score" gorm:"default:0"`
	Sort         int            `json:"sort" gorm:"default:0"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

type QuestionOption struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	QuestionID uint      `json:"question_id" gorm:"index"`
	OptionKey  string    `json:"option_key" gorm:"size:10"`
	OptionText string    `json:"option_text" gorm:"type:text"`
	Sort       int       `json:"sort" gorm:"default:0"`
	CreatedAt  time.Time `json:"created_at"`
}

type ForumPost struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     uint           `json:"user_id" gorm:"index"`
	Title      string         `json:"title" gorm:"size:200;not null"`
	Content    string         `json:"content" gorm:"type:text"`
	Category   string         `json:"category" gorm:"size:50"`
	Image      string         `json:"image" gorm:"size:255"`
	ViewCount  int            `json:"view_count" gorm:"default:0"`
	LikeCount  int            `json:"like_count" gorm:"default:0"`
	Status     int            `json:"status" gorm:"default:1"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

type ExamRecord struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     uint           `json:"user_id" gorm:"index"`
	PaperID    uint           `json:"paper_id" gorm:"index"`
	PaperTitle string         `json:"paper_title" gorm:"size:200"`
	Score      int            `json:"score"`
	TotalScore int            `json:"total_score"`
	IsPass     int            `json:"is_pass" gorm:"default:0"`
	StartTime  *time.Time     `json:"start_time"`
	EndTime    *time.Time     `json:"end_time"`
	Duration   int            `json:"duration"`
	CreatedAt  time.Time      `json:"created_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

type ExamAnswer struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	ExamRecordID uint      `json:"exam_record_id" gorm:"index"`
	QuestionID   uint      `json:"question_id" gorm:"index"`
	UserAnswer   string    `json:"user_answer" gorm:"type:text"`
	CorrectAnswer string   `json:"correct_answer" gorm:"type:text"`
	IsCorrect    int       `json:"is_correct" gorm:"default:0"`
	Score        int       `json:"score" gorm:"default:0"`
	CreatedAt    time.Time `json:"created_at"`
}

type WrongQuestion struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     uint           `json:"user_id" gorm:"index"`
	QuestionID uint           `json:"question_id" gorm:"index"`
	PaperID    uint           `json:"paper_id" gorm:"index"`
	WrongCount int            `json:"wrong_count" gorm:"default:1"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}
