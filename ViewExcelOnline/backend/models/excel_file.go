package models

import (
	"time"

	"excel-viewer/config"
)

type ExcelFile struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	Filename      string     `gorm:"size:255;not null" json:"filename"`
	StoredName    string     `gorm:"size:255;not null" json:"stored_name"`
	FilePath      string     `gorm:"size:500;not null" json:"file_path"`
	FileSize      int64      `json:"file_size"`
	SheetCount    int        `json:"sheet_count"`
	ShareToken    string     `gorm:"size:100;unique" json:"share_token"`
	ShareExpireAt *time.Time `json:"share_expire_at"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

func (ExcelFile) TableName() string {
	return "excel_files"
}

func CreateExcelFile(file *ExcelFile) error {
	return config.DB.Create(file).Error
}

func GetExcelFileByID(id uint) (*ExcelFile, error) {
	var file ExcelFile
	err := config.DB.First(&file, id).Error
	if err != nil {
		return nil, err
	}
	return &file, nil
}

func GetExcelFileByToken(token string) (*ExcelFile, error) {
	var file ExcelFile
	err := config.DB.Where("share_token = ?", token).First(&file).Error
	if err != nil {
		return nil, err
	}
	return &file, nil
}

func UpdateExcelFile(file *ExcelFile) error {
	return config.DB.Save(file).Error
}
