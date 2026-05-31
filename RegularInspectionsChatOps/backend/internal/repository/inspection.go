package repository

import (
	"inspection-chatops/internal/model"
	"inspection-chatops/pkg/mysql"
)

type InspectionRepository struct{}

func NewInspectionRepository() *InspectionRepository {
	return &InspectionRepository{}
}

func (r *InspectionRepository) Create(task *model.InspectionTask) error {
	return mysql.DB.Create(task).Error
}

func (r *InspectionRepository) GetByID(id uint64) (*model.InspectionTask, error) {
	var task model.InspectionTask
	err := mysql.DB.First(&task, id).Error
	return &task, err
}

func (r *InspectionRepository) Update(task *model.InspectionTask) error {
	return mysql.DB.Save(task).Error
}

func (r *InspectionRepository) Delete(id uint64) error {
	return mysql.DB.Delete(&model.InspectionTask{}, id).Error
}

func (r *InspectionRepository) List(page, pageSize int, status int8, keyword string) ([]model.InspectionTask, int64, error) {
	var tasks []model.InspectionTask
	var total int64

	query := mysql.DB.Model(&model.InspectionTask{})

	if status != 0 {
		query = query.Where("status = ?", status)
	}

	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	err = query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&tasks).Error
	return tasks, total, err
}

func (r *InspectionRepository) GetAllEnabled() ([]model.InspectionTask, error) {
	var tasks []model.InspectionTask
	err := mysql.DB.Where("status = ?", 1).Find(&tasks).Error
	return tasks, err
}

type ResultRepository struct{}

func NewResultRepository() *ResultRepository {
	return &ResultRepository{}
}

func (r *ResultRepository) Create(result *model.InspectionResult) error {
	return mysql.DB.Create(result).Error
}

func (r *ResultRepository) GetByID(id uint64) (*model.InspectionResult, error) {
	var result model.InspectionResult
	err := mysql.DB.First(&result, id).Error
	return &result, err
}

func (r *ResultRepository) Update(result *model.InspectionResult) error {
	return mysql.DB.Save(result).Error
}

func (r *ResultRepository) List(req *model.ResultListRequest) ([]model.InspectionResult, int64, error) {
	var results []model.InspectionResult
	var total int64

	query := mysql.DB.Model(&model.InspectionResult{})

	if req.TaskID > 0 {
		query = query.Where("task_id = ?", req.TaskID)
	}

	if req.Status >= 0 {
		query = query.Where("status = ?", req.Status)
	}

	if req.StartDate != "" {
		query = query.Where("created_at >= ?", req.StartDate)
	}

	if req.EndDate != "" {
		query = query.Where("created_at <= ?", req.EndDate+" 23:59:59")
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (req.Page - 1) * req.PageSize
	err = query.Offset(offset).Limit(req.PageSize).Order("id DESC").Find(&results).Error
	return results, total, err
}

func (r *ResultRepository) GetUnnotifiedResults() ([]model.InspectionResult, error) {
	var results []model.InspectionResult
	err := mysql.DB.Where("notified = ?", 0).Where("status IN (?)", []int8{0, 1}).Find(&results).Error
	return results, err
}

func (r *ResultRepository) MarkAsNotified(ids []uint64) error {
	return mysql.DB.Model(&model.InspectionResult{}).Where("id IN ?", ids).Update("notified", 1).Error
}
