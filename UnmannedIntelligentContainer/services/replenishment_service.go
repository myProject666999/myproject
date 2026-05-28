package services

import (
	"errors"
	"fmt"
	"time"

	"unmanned-container/config"
	"unmanned-container/models"
	"unmanned-container/utils"
)

type ReplenishmentService struct {
	inventoryService *InventoryService
}

func NewReplenishmentService() *ReplenishmentService {
	return &ReplenishmentService{
		inventoryService: NewInventoryService(),
	}
}

func (s *ReplenishmentService) GetList(query *models.ReplenishmentTaskQuery) ([]models.ReplenishmentTask, int64, error) {
	var tasks []models.ReplenishmentTask
	var total int64

	db := config.DB.Model(&models.ReplenishmentTask{}).Preload("Replenisher")

	if query.TaskNo != "" {
		db = db.Where("task_no LIKE ?", "%"+query.TaskNo+"%")
	}

	if query.ReplenisherID != nil {
		db = db.Where("replenisher_id = ?", *query.ReplenisherID)
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

	if err := db.Offset(offset).Limit(pageSize).Order("id DESC").Find(&tasks).Error; err != nil {
		return nil, 0, err
	}

	return tasks, total, nil
}

func (s *ReplenishmentService) GetByID(id uint64) (*models.ReplenishmentTask, error) {
	var task models.ReplenishmentTask
	if err := config.DB.Preload("Replenisher").Preload("Items.Container").Preload("Items.Product").First(&task, id).Error; err != nil {
		return nil, err
	}
	return &task, nil
}

func (s *ReplenishmentService) GenerateTasks(area string) ([]models.ReplenishmentTask, error) {
	lowStockItems, err := s.inventoryService.GetLowStockItems(area)
	if err != nil {
		return nil, err
	}

	if len(lowStockItems) == 0 {
		return nil, errors.New("no low stock items found")
	}

	areaGroups := make(map[string][]models.LowStockItem)
	for _, item := range lowStockItems {
		areaGroups[item.Area] = append(areaGroups[item.Area], item)
	}

	var createdTasks []models.ReplenishmentTask

	for areaName, items := range areaGroups {
		taskNo := utils.GenerateTaskNo()
		now := time.Now()

		containerSet := make(map[uint64]bool)
		productSet := make(map[uint64]bool)
		totalQuantity := 0

		for _, item := range items {
			containerSet[item.ContainerID] = true
			productSet[item.ProductID] = true
			totalQuantity += item.NeedQuantity
		}

		task := &models.ReplenishmentTask{
			TaskNo:         taskNo,
			Area:           areaName,
			ContainerCount: len(containerSet),
			ProductCount:   len(productSet),
			TotalQuantity:  totalQuantity,
			Status:         0,
			PlannedTime:    &now,
		}

		tx := config.DB.Begin()
		if tx.Error != nil {
			return nil, tx.Error
		}

		if err := tx.Create(task).Error; err != nil {
			tx.Rollback()
			return nil, err
		}

		for _, item := range items {
			idempotentKey := fmt.Sprintf("%d_%d_%d", task.ID, item.ContainerID, item.ProductID)
			taskItem := &models.ReplenishmentTaskItem{
				TaskID:          task.ID,
				ContainerID:     item.ContainerID,
				ProductID:       item.ProductID,
				PlannedQuantity: item.NeedQuantity,
				Status:          0,
				IdempotentKey:   idempotentKey,
			}
			if err := tx.Create(taskItem).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		}

		if err := tx.Commit().Error; err != nil {
			return nil, err
		}

		createdTasks = append(createdTasks, *task)
	}

	return createdTasks, nil
}

func (s *ReplenishmentService) DispatchTask(taskID uint64, data *models.ReplenishmentTaskDispatch) (*models.ReplenishmentTask, error) {
	var task models.ReplenishmentTask
	if err := config.DB.First(&task, taskID).Error; err != nil {
		return nil, err
	}

	if task.Status != 0 {
		return nil, errors.New("task has already been dispatched")
	}

	updates := map[string]interface{}{
		"replenisher_id": data.ReplenisherID,
		"status":         1,
	}

	if err := config.DB.Model(&task).Updates(updates).Error; err != nil {
		return nil, err
	}

	task.ReplenisherID = &data.ReplenisherID
	task.Status = 1

	return &task, nil
}

func (s *ReplenishmentService) StartTask(taskID uint64) (*models.ReplenishmentTask, error) {
	var task models.ReplenishmentTask
	if err := config.DB.First(&task, taskID).Error; err != nil {
		return nil, err
	}

	if task.Status != 1 {
		return nil, errors.New("task cannot be started")
	}

	now := time.Now()
	updates := map[string]interface{}{
		"status":     2,
		"start_time": now,
	}

	if err := config.DB.Model(&task).Updates(updates).Error; err != nil {
		return nil, err
	}

	task.Status = 2
	task.StartTime = &now

	return &task, nil
}

func (s *ReplenishmentService) ExecuteTask(data *models.ReplenishmentTaskExecute) (*models.ReplenishmentTask, error) {
	var task models.ReplenishmentTask
	if err := config.DB.First(&task, data.TaskID).Error; err != nil {
		return nil, err
	}

	if task.Status != 2 {
		return nil, errors.New("task is not in progress")
	}

	tx := config.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	now := time.Now()
	totalActualQuantity := 0

	for _, item := range data.Items {
		idempotentKey := fmt.Sprintf("%d_%d_%d", data.TaskID, item.ContainerID, item.ProductID)

		var taskItem models.ReplenishmentTaskItem
		err := tx.Where("idempotent_key = ?", idempotentKey).First(&taskItem).Error
		if err != nil {
			tx.Rollback()
			return nil, errors.New("invalid task item: " + idempotentKey)
		}

		if taskItem.Status == 1 {
			totalActualQuantity += item.ActualQuantity
			continue
		}

		if err := tx.Model(&taskItem).Updates(map[string]interface{}{
			"actual_quantity": item.ActualQuantity,
			"status":          1,
		}).Error; err != nil {
			tx.Rollback()
			return nil, err
		}

		inventory, err := s.inventoryService.GetByContainerAndProduct(item.ContainerID, item.ProductID)
		if err != nil {
			tx.Rollback()
			return nil, err
		}

		newQuantity := inventory.Quantity + item.ActualQuantity
		if newQuantity > inventory.MaxQuantity {
			newQuantity = inventory.MaxQuantity
		}

		if err := tx.Model(&models.Inventory{}).
			Where("id = ?", inventory.ID).
			Updates(map[string]interface{}{
				"quantity":            newQuantity,
				"last_replenish_time": now,
			}).Error; err != nil {
			tx.Rollback()
			return nil, err
		}

		totalActualQuantity += item.ActualQuantity
	}

	var pendingItems int64
	tx.Model(&models.ReplenishmentTaskItem{}).
		Where("task_id = ? AND status = 0", data.TaskID).
		Count(&pendingItems)

	status := int8(2)
	if pendingItems == 0 {
		status = 3
	}

	updates := map[string]interface{}{
		"total_quantity": totalActualQuantity,
	}

	if status == 3 {
		updates["status"] = 3
		updates["finish_time"] = now
	}

	if err := tx.Model(&task).Updates(updates).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &task, nil
}

func (s *ReplenishmentService) CancelTask(taskID uint64) (*models.ReplenishmentTask, error) {
	var task models.ReplenishmentTask
	if err := config.DB.First(&task, taskID).Error; err != nil {
		return nil, err
	}

	if task.Status >= 3 {
		return nil, errors.New("task cannot be cancelled")
	}

	if err := config.DB.Model(&task).Update("status", 4).Error; err != nil {
		return nil, err
	}

	task.Status = 4
	return &task, nil
}
