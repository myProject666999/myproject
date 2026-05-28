package services

import (
	"unmanned-container/config"
	"unmanned-container/models"
)

type ReplenisherService struct{}

func NewReplenisherService() *ReplenisherService {
	return &ReplenisherService{}
}

func (s *ReplenisherService) GetList(query *models.ReplenisherQuery) ([]models.Replenisher, int64, error) {
	var replenishers []models.Replenisher
	var total int64

	db := config.DB.Model(&models.Replenisher{})

	if query.Keyword != "" {
		keyword := "%" + query.Keyword + "%"
		db = db.Where("name LIKE ? OR employee_no LIKE ? OR phone LIKE ?", keyword, keyword, keyword)
	}

	if query.Area != "" {
		db = db.Where("area LIKE ?", "%"+query.Area+"%")
	}

	if query.Status != nil {
		db = db.Where("status = ?", *query.Status)
	}

	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	page := query.Page
	pageSize := query.PageSize
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	if err := db.Offset(offset).Limit(pageSize).Order("id DESC").Find(&replenishers).Error; err != nil {
		return nil, 0, err
	}

	return replenishers, total, nil
}

func (s *ReplenisherService) GetAll() ([]models.Replenisher, error) {
	var replenishers []models.Replenisher
	if err := config.DB.Where("status = 1").Order("id DESC").Find(&replenishers).Error; err != nil {
		return nil, err
	}
	return replenishers, nil
}

func (s *ReplenisherService) GetByID(id uint64) (*models.Replenisher, error) {
	var replenisher models.Replenisher
	if err := config.DB.First(&replenisher, id).Error; err != nil {
		return nil, err
	}
	return &replenisher, nil
}

func (s *ReplenisherService) Create(data *models.ReplenisherCreate) (*models.Replenisher, error) {
	replenisher := &models.Replenisher{
		EmployeeNo: data.EmployeeNo,
		Name:       data.Name,
		Phone:      data.Phone,
		Area:       data.Area,
		Status:     data.Status,
	}
	if replenisher.Status == 0 {
		replenisher.Status = 1
	}
	if err := config.DB.Create(replenisher).Error; err != nil {
		return nil, err
	}
	return replenisher, nil
}

func (s *ReplenisherService) Update(id uint64, data *models.ReplenisherUpdate) (*models.Replenisher, error) {
	replenisher, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	updates := make(map[string]interface{})
	if data.Name != "" {
		updates["name"] = data.Name
	}
	if data.Phone != "" {
		updates["phone"] = data.Phone
	}
	if data.Area != "" {
		updates["area"] = data.Area
	}
	if data.Status != nil {
		updates["status"] = *data.Status
	}

	if err := config.DB.Model(replenisher).Updates(updates).Error; err != nil {
		return nil, err
	}

	return replenisher, nil
}

func (s *ReplenisherService) Delete(id uint64) error {
	if err := config.DB.Delete(&models.Replenisher{}, id).Error; err != nil {
		return err
	}
	return nil
}
