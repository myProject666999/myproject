package models

import (
	"time"

	"gorm.io/gorm"
)

type CourseCategory struct {
	ID          uint64    `gorm:"primaryKey;column:id" json:"id"`
	Name        string    `gorm:"size:50;not null;column:name" json:"name"`
	ParentID    uint64    `gorm:"default:0;index:idx_parent_id;column:parent_id" json:"parent_id"`
	SortOrder   uint      `gorm:"default:0;not null;column:sort_order" json:"sort_order"`
	Icon        string    `gorm:"size:200;column:icon" json:"icon"`
	Description string    `gorm:"size:200;column:description" json:"description"`
	Status      uint8     `gorm:"default:1;not null;column:status" json:"status"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (CourseCategory) TableName() string { return "course_categories" }

type Course struct {
	ID            uint64         `gorm:"primaryKey;column:id" json:"id"`
	TeacherID     uint64         `gorm:"index:idx_teacher_id;not null;column:teacher_id" json:"teacher_id"`
	CategoryID    uint64         `gorm:"index:idx_category_id;not null;column:category_id" json:"category_id"`
	Title         string         `gorm:"size:200;not null;column:title" json:"title"`
	Subtitle      string         `gorm:"size:200;column:subtitle" json:"subtitle"`
	CoverImage    string         `gorm:"size:500;column:cover_image" json:"cover_image"`
	Description   string         `gorm:"type:text;column:description" json:"description"`
	Level         uint8          `gorm:"default:0;not null;column:level" json:"level"`
	Price         float64        `gorm:"type:decimal(10,2);default:0.00;not null;column:price" json:"price"`
	OriginalPrice float64        `gorm:"type:decimal(10,2);default:0.00;not null;column:original_price" json:"original_price"`
	Duration      uint           `gorm:"default:0;not null;column:duration" json:"duration"`
	StudentCount  uint           `gorm:"default:0;not null;column:student_count" json:"student_count"`
	RatingAvg     float64        `gorm:"type:decimal(3,2);default:0.00;not null;index:idx_rating_avg;column:rating_avg" json:"rating_avg"`
	RatingCount   uint           `gorm:"default:0;not null;column:rating_count" json:"rating_count"`
	Tags          string         `gorm:"size:500;column:tags" json:"tags"`
	Status        uint8          `gorm:"default:0;not null;index:idx_status;column:status" json:"status"`
	PublishedAt   *time.Time     `gorm:"column:published_at" json:"published_at"`
	CreatedAt     time.Time      `gorm:"index:idx_created_at;column:created_at" json:"created_at"`
	UpdatedAt     time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
}

func (Course) TableName() string { return "courses" }

type CourseChapter struct {
	ID          uint64    `gorm:"primaryKey;column:id" json:"id"`
	CourseID    uint64    `gorm:"index:idx_course_id;not null;column:course_id" json:"course_id"`
	Title       string    `gorm:"size:200;not null;column:title" json:"title"`
	Description string    `gorm:"size:500;column:description" json:"description"`
	SortOrder   uint      `gorm:"default:0;not null;column:sort_order" json:"sort_order"`
	IsFree      bool      `gorm:"default:false;not null;column:is_free" json:"is_free"`
	CreatedAt   time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (CourseChapter) TableName() string { return "course_chapters" }

type CourseLesson struct {
	ID        uint64    `gorm:"primaryKey;column:id" json:"id"`
	ChapterID uint64    `gorm:"index:idx_chapter_id;not null;column:chapter_id" json:"chapter_id"`
	CourseID  uint64    `gorm:"index:idx_course_id;not null;column:course_id" json:"course_id"`
	Title     string    `gorm:"size:200;not null;column:title" json:"title"`
	LessonType uint8   `gorm:"default:1;not null;column:lesson_type" json:"lesson_type"`
	VideoID   uint64    `gorm:"index:idx_video_id;column:video_id" json:"video_id"`
	Content   string    `gorm:"type:text;column:content" json:"content"`
	SortOrder uint      `gorm:"default:0;not null;column:sort_order" json:"sort_order"`
	Duration  uint      `gorm:"default:0;not null;column:duration" json:"duration"`
	IsFree    bool      `gorm:"default:false;not null;column:is_free" json:"is_free"`
	Status    uint8     `gorm:"default:1;not null;column:status" json:"status"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (CourseLesson) TableName() string { return "course_lessons" }
