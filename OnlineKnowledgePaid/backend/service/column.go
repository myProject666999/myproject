package service

import (
	"gorm.io/gorm"

	"online-knowledge-paid/model"
)

type ColumnService struct{}

func (s *ColumnService) CreateColumn(db *gorm.DB, column *model.Column) error {
	return db.Create(column).Error
}

func (s *ColumnService) GetColumns(db *gorm.DB, page, pageSize int) ([]model.Column, int64, error) {
	var columns []model.Column
	var total int64

	offset := (page - 1) * pageSize

	db.Model(&model.Column{}).Count(&total)

	if err := db.Preload("Author").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&columns).Error; err != nil {
		return nil, 0, err
	}
	return columns, total, nil
}

func (s *ColumnService) GetColumnByID(db *gorm.DB, id uint64) (*model.Column, error) {
	var column model.Column
	if err := db.Preload("Author").First(&column, id).Error; err != nil {
		return nil, err
	}
	return &column, nil
}

func (s *ColumnService) UpdateColumn(db *gorm.DB, column *model.Column) error {
	return db.Save(column).Error
}

func (s *ColumnService) DeleteColumn(db *gorm.DB, id uint64) error {
	return db.Delete(&model.Column{}, id).Error
}

func (s *ColumnService) GetColumnsByAuthor(db *gorm.DB, authorID uint64) ([]model.Column, error) {
	var columns []model.Column
	if err := db.Preload("Author").Where("author_id = ?", authorID).Order("created_at DESC").Find(&columns).Error; err != nil {
		return nil, err
	}
	return columns, nil
}