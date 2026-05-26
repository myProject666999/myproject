package models

import (
	"time"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

type ConversionJob struct {
	ID          string    `gorm:"primary_key;type:varchar(36)" json:"id"`
	URL         string    `gorm:"type:text;not null" json:"url"`
	Title       string    `gorm:"type:varchar(255)" json:"title"`
	Style       string    `gorm:"type:varchar(50);default:'default'" json:"style"`
	EnableTOC   bool      `gorm:"default:true" json:"enable_toc"`
	Pagination  string    `gorm:"type:varchar(50);default:'A4'" json:"pagination"`
	Status      string    `gorm:"type:varchar(20);default:'pending'" json:"status"`
	FilePath    string    `gorm:"type:varchar(500)" json:"file_path"`
	PageCount   int       `gorm:"default:0" json:"page_count"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	CompletedAt *time.Time `json:"completed_at"`
}

type BatchJob struct {
	ID          string    `gorm:"primary_key;type:varchar(36)" json:"id"`
	Name        string    `gorm:"type:varchar(255)" json:"name"`
	Status      string    `gorm:"type:varchar(20);default:'pending'" json:"status"`
	TotalCount  int       `gorm:"default:0" json:"total_count"`
	SuccessCount int      `gorm:"default:0" json:"success_count"`
	FailedCount  int      `gorm:"default:0" json:"failed_count"`
	CreatedAt   time.Time `json:"created_at"`
	CompletedAt *time.Time `json:"completed_at"`
	Jobs        []ConversionJob `gorm:"-" json:"jobs,omitempty"`
}

var DB *gorm.DB

func InitDB(dataSourceName string) error {
	var err error
	DB, err = gorm.Open("mysql", dataSourceName)
	if err != nil {
		return err
	}

	DB.AutoMigrate(&ConversionJob{}, &BatchJob{})
	return nil
}
