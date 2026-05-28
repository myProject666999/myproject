package services

import (
	"unmanned-container/config"
	"unmanned-container/models"
)

type ContainerService struct{}

func NewContainerService() *ContainerService {
	return &ContainerService{}
}

func (s *ContainerService) GetList(query *models.ContainerQuery) ([]models.Container, int64, error) {
	var containers []models.Container
	var total int64

	db := config.DB.Model(&models.Container{})

	if query.Keyword != "" {
		keyword := "%" + query.Keyword + "%"
		db = db.Where("name LIKE ? OR container_no LIKE ? OR address LIKE ?", keyword, keyword, keyword)
	}

	if query.Area != "" {
		db = db.Where("area = ?", query.Area)
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

	if err := db.Offset(offset).Limit(pageSize).Order("id DESC").Find(&containers).Error; err != nil {
		return nil, 0, err
	}

	return containers, total, nil
}

func (s *ContainerService) GetAll() ([]models.Container, error) {
	var containers []models.Container
	if err := config.DB.Where("status = 1").Order("id DESC").Find(&containers).Error; err != nil {
		return nil, err
	}
	return containers, nil
}

func (s *ContainerService) GetByID(id uint64) (*models.Container, error) {
	var container models.Container
	if err := config.DB.First(&container, id).Error; err != nil {
		return nil, err
	}
	return &container, nil
}

func (s *ContainerService) Create(data *models.ContainerCreate) (*models.Container, error) {
	container := &models.Container{
		ContainerNo: data.ContainerNo,
		Name:        data.Name,
		Address:     data.Address,
		Longitude:   data.Longitude,
		Latitude:    data.Latitude,
		Area:        data.Area,
		Status:      data.Status,
		Capacity:    data.Capacity,
	}
	if container.Status == 0 {
		container.Status = 1
	}
	if container.Capacity == 0 {
		container.Capacity = 100
	}
	if err := config.DB.Create(container).Error; err != nil {
		return nil, err
	}
	return container, nil
}

func (s *ContainerService) Update(id uint64, data *models.ContainerUpdate) (*models.Container, error) {
	container, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	updates := make(map[string]interface{})
	if data.Name != "" {
		updates["name"] = data.Name
	}
	if data.Address != "" {
		updates["address"] = data.Address
	}
	if data.Longitude != 0 {
		updates["longitude"] = data.Longitude
	}
	if data.Latitude != 0 {
		updates["latitude"] = data.Latitude
	}
	if data.Area != "" {
		updates["area"] = data.Area
	}
	if data.Status != nil {
		updates["status"] = *data.Status
	}
	if data.Capacity > 0 {
		updates["capacity"] = data.Capacity
	}

	if err := config.DB.Model(container).Updates(updates).Error; err != nil {
		return nil, err
	}

	return container, nil
}

func (s *ContainerService) Delete(id uint64) error {
	if err := config.DB.Delete(&models.Container{}, id).Error; err != nil {
		return err
	}
	return nil
}
