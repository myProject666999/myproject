package services

import (
	"unmanned-container/config"
	"unmanned-container/models"
	"unmanned-container/utils"
)

type StockCheckService struct {
	inventoryService *InventoryService
	productService   *ProductService
}

func NewStockCheckService() *StockCheckService {
	return &StockCheckService{
		inventoryService: NewInventoryService(),
		productService:   NewProductService(),
	}
}

func (s *StockCheckService) GetCheckList(query *models.StockCheckQuery) ([]models.StockCheck, int64, error) {
	var checks []models.StockCheck
	var total int64

	db := config.DB.Model(&models.StockCheck{}).Preload("Container").Preload("Replenisher")

	if query.CheckNo != "" {
		db = db.Where("check_no LIKE ?", "%"+query.CheckNo+"%")
	}

	if query.ContainerID > 0 {
		db = db.Where("container_id = ?", query.ContainerID)
	}

	if query.ReplenisherID > 0 {
		db = db.Where("replenisher_id = ?", query.ReplenisherID)
	}

	if query.StartDate != "" {
		db = db.Where("check_time >= ?", query.StartDate)
	}

	if query.EndDate != "" {
		db = db.Where("check_time <= ?", query.EndDate+" 23:59:59")
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

	if err := db.Offset(offset).Limit(pageSize).Order("id DESC").Find(&checks).Error; err != nil {
		return nil, 0, err
	}

	return checks, total, nil
}

func (s *StockCheckService) GetCheckByID(id uint64) (*models.StockCheck, error) {
	var check models.StockCheck
	if err := config.DB.Preload("Container").Preload("Replenisher").Preload("Items.Product").First(&check, id).Error; err != nil {
		return nil, err
	}
	return &check, nil
}

func (s *StockCheckService) CreateCheck(data *models.StockCheckCreate) (*models.StockCheck, error) {
	checkNo := utils.GenerateCheckNo()

	totalExpected := 0
	totalActual := 0
	totalDifference := 0
	totalDamageAmount := 0.0

	var checkItems []models.StockCheckItem

	for _, item := range data.Items {
		product, err := s.productService.GetByID(item.ProductID)
		if err != nil {
			return nil, err
		}

		difference := item.ActualQuantity - item.ExpectedQuantity
		differenceAmount := float64(difference) * product.Price
		damageAmount := float64(item.DamageQuantity) * product.Price

		totalExpected += item.ExpectedQuantity
		totalActual += item.ActualQuantity
		totalDifference += difference
		totalDamageAmount += damageAmount

		checkItem := models.StockCheckItem{
			BaseModel:        models.BaseModel{ID: 0},
			ProductID:        item.ProductID,
			ExpectedQuantity: item.ExpectedQuantity,
			ActualQuantity:   item.ActualQuantity,
			Difference:       difference,
			UnitPrice:        product.Price,
			DifferenceAmount: differenceAmount,
			DamageQuantity:   item.DamageQuantity,
			DamageReason:     item.DamageReason,
		}
		checkItems = append(checkItems, checkItem)
	}

	check := &models.StockCheck{
		CheckNo:         checkNo,
		ContainerID:     data.ContainerID,
		ReplenisherID:   data.ReplenisherID,
		CheckTime:       data.CheckTime.ToTime(),
		TotalExpected:   totalExpected,
		TotalActual:     totalActual,
		TotalDifference: totalDifference,
		DamageAmount:    totalDamageAmount,
		Status:          0,
		Remark:          data.Remark,
	}

	tx := config.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	if err := tx.Create(check).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	for i := range checkItems {
		checkItems[i].BaseModel = models.BaseModel{ID: 0}
		checkItems[i].CheckID = check.ID
	}

	if len(checkItems) > 0 {
		if err := tx.Create(&checkItems).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	check.Items = checkItems

	for _, item := range data.Items {
		if item.DamageQuantity > 0 {
			product, _ := s.productService.GetByID(item.ProductID)
			damageRecord := &models.DamageRecord{
				BaseModel:   models.BaseModel{ID: 0},
				RecordNo:    utils.GenerateDamageNo(),
				ContainerID: data.ContainerID,
				ProductID:   item.ProductID,
				Quantity:    item.DamageQuantity,
				UnitPrice:   product.Price,
				TotalAmount: float64(item.DamageQuantity) * product.Price,
				Reason:      item.DamageReason,
				HandlerID:   data.ReplenisherID,
				HandleTime:  data.CheckTime.ToTime(),
				CheckID:     &check.ID,
			}
			if err := tx.Create(damageRecord).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return check, nil
}

func (s *StockCheckService) ProcessCheck(data *models.StockCheckProcess) (*models.StockCheck, error) {
	var check models.StockCheck
	if err := config.DB.First(&check, data.CheckID).Error; err != nil {
		return nil, err
	}

	if check.Status == 1 {
		return &check, nil
	}

	tx := config.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	updates := map[string]interface{}{
		"status": 1,
	}
	if data.Remark != "" {
		updates["remark"] = data.Remark
	}

	if err := tx.Model(&check).Updates(updates).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	var items []models.StockCheckItem
	if err := tx.Where("check_id = ?", check.ID).Find(&items).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	for _, item := range items {
		if item.Difference != 0 {
			inventory, err := s.inventoryService.GetByContainerAndProduct(check.ContainerID, item.ProductID)
			if err != nil {
				tx.Rollback()
				return nil, err
			}

			newQuantity := item.ActualQuantity
			if err := tx.Model(&models.Inventory{}).
				Where("id = ?", inventory.ID).
				Update("quantity", newQuantity).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	check.Status = 1
	return &check, nil
}

func (s *StockCheckService) GetDamageList(query *models.DamageRecordQuery) ([]models.DamageRecord, int64, error) {
	var records []models.DamageRecord
	var total int64

	db := config.DB.Model(&models.DamageRecord{}).Preload("Container").Preload("Product").Preload("Handler")

	if query.RecordNo != "" {
		db = db.Where("record_no LIKE ?", "%"+query.RecordNo+"%")
	}

	if query.ContainerID > 0 {
		db = db.Where("container_id = ?", query.ContainerID)
	}

	if query.ProductID > 0 {
		db = db.Where("product_id = ?", query.ProductID)
	}

	if query.StartDate != "" {
		db = db.Where("handle_time >= ?", query.StartDate)
	}

	if query.EndDate != "" {
		db = db.Where("handle_time <= ?", query.EndDate+" 23:59:59")
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

	if err := db.Offset(offset).Limit(pageSize).Order("id DESC").Find(&records).Error; err != nil {
		return nil, 0, err
	}

	return records, total, nil
}

func (s *StockCheckService) CreateDamageRecord(data *models.DamageRecordCreate) (*models.DamageRecord, error) {
	product, err := s.productService.GetByID(data.ProductID)
	if err != nil {
		return nil, err
	}

	record := &models.DamageRecord{
		RecordNo:    utils.GenerateDamageNo(),
		ContainerID: data.ContainerID,
		ProductID:   data.ProductID,
		Quantity:    data.Quantity,
		UnitPrice:   product.Price,
		TotalAmount: float64(data.Quantity) * product.Price,
		Reason:      data.Reason,
		HandlerID:   data.HandlerID,
		HandleTime:  data.HandleTime.ToTime(),
		CheckID:     data.CheckID,
	}

	tx := config.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	if err := tx.Create(record).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	inventory, err := s.inventoryService.GetByContainerAndProduct(data.ContainerID, data.ProductID)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	newQuantity := inventory.Quantity - data.Quantity
	if newQuantity < 0 {
		newQuantity = 0
	}

	if err := tx.Model(&models.Inventory{}).
		Where("id = ?", inventory.ID).
		Update("quantity", newQuantity).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return record, nil
}
