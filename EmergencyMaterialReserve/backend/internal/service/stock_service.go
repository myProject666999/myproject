package service

import (
	"crypto/md5"
	"encoding/hex"
	"emergency-material/internal/database"
	"emergency-material/internal/models"
	"errors"
	"fmt"
	"strconv"
	"time"

	"gorm.io/gorm"
)

type StockInParams struct {
	BizType        string     `json:"biz_type"`
	WarehouseID    uint64     `json:"warehouse_id"`
	MaterialID     uint64     `json:"material_id"`
	BatchNo        string     `json:"batch_no"`
	Quantity       int        `json:"quantity"`
	UnitPrice      *float64   `json:"unit_price"`
	ProductionDate *time.Time `json:"production_date"`
	ExpiryDate     *time.Time `json:"expiry_date"`
	RelatedOrderID *uint64    `json:"related_order_id"`
	RelatedOrderNo string     `json:"related_order_no"`
	OperatorID     *uint64    `json:"operator_id"`
	Remark         *string    `json:"remark"`
}

type StockOutParams struct {
	BizType        string  `json:"biz_type"`
	WarehouseID    uint64  `json:"warehouse_id"`
	MaterialID     uint64  `json:"material_id"`
	Quantity       int     `json:"quantity"`
	RelatedOrderID *uint64 `json:"related_order_id"`
	RelatedOrderNo string  `json:"related_order_no"`
	OperatorID     *uint64 `json:"operator_id"`
	Remark         *string `json:"remark"`
}

type StockRecordQueryParams struct {
	Type         *string `json:"type"`
	BizType      *string `json:"biz_type"`
	WarehouseID  *uint64 `json:"warehouse_id"`
	MaterialID   *uint64 `json:"material_id"`
	BatchNo      *string `json:"batch_no"`
	OperatorID   *uint64 `json:"operator_id"`
	StartTime    *time.Time `json:"start_time"`
	EndTime      *time.Time `json:"end_time"`
	Page         int     `json:"page"`
	PageSize     int     `json:"page_size"`
}

type StockRecordListResponse struct {
	Total int64              `json:"total"`
	List  []models.StockRecord `json:"list"`
	Page  int                `json:"page"`
	Size  int                `json:"size"`
}

type StockResult struct {
	RecordNo string `json:"record_no"`
}

func generateIdempotentKey(bizType string, warehouseID, materialID uint64, batchNo string, timestamp int64) string {
	data := fmt.Sprintf("%s:%d:%d:%s:%d", bizType, warehouseID, materialID, batchNo, timestamp)
	hash := md5.Sum([]byte(data))
	return hex.EncodeToString(hash[:])
}

func generateRecordNo() string {
	now := time.Now()
	return "SR" + now.Format("20060102150405") + strconv.FormatInt(now.UnixNano()%100000, 10)
}

func StockIn(params *StockInParams) (*StockResult, error) {
	if params.Quantity <= 0 {
		return nil, errors.New("quantity must be greater than 0")
	}

	timestamp := time.Now().Unix()
	idempotentKey := generateIdempotentKey(params.BizType, params.WarehouseID, params.MaterialID, params.BatchNo, timestamp)

	var existingRecord models.StockRecord
	err := database.DB.Where("idempotent_key = ?", idempotentKey).First(&existingRecord).Error
	if err == nil {
		return &StockResult{RecordNo: existingRecord.RecordNo}, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var inventory models.Inventory
	err = tx.Where("warehouse_id = ? AND material_id = ? AND batch_no = ?",
		params.WarehouseID, params.MaterialID, params.BatchNo).
		First(&inventory).Error

	beforeQuantity := 0
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			inventory = models.Inventory{
				WarehouseID:       params.WarehouseID,
				MaterialID:        params.MaterialID,
				BatchNo:         params.BatchNo,
				Quantity:        params.Quantity,
				AvailableQuantity: params.Quantity,
				UnitPrice:       params.UnitPrice,
				ProductionDate:  params.ProductionDate,
				ExpiryDate:    params.ExpiryDate,
			}
			if err = tx.Create(&inventory).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		} else {
			tx.Rollback()
			return nil, err
		}
	} else {
		beforeQuantity = inventory.Quantity
		inventory.Quantity += params.Quantity
		inventory.AvailableQuantity += params.Quantity
		if params.UnitPrice != nil {
			inventory.UnitPrice = params.UnitPrice
		}
		if params.ProductionDate != nil {
			inventory.ProductionDate = params.ProductionDate
		}
		if params.ExpiryDate != nil {
			inventory.ExpiryDate = params.ExpiryDate
		}
		if err = tx.Save(&inventory).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	afterQuantity := inventory.Quantity
	inventoryID := inventory.ID

	if err = UpdateInventorySummary(tx, params.WarehouseID, params.MaterialID); err != nil {
		tx.Rollback()
		return nil, err
	}

	if inventory.ExpiryDate != nil {
		if err = UpdateInventoryWarningLevel(tx, &inventory); err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	recordNo := generateRecordNo()
	stockRecord := models.StockRecord{
		RecordNo:      recordNo,
		Type:          "in",
		BizType:       params.BizType,
		WarehouseID:   params.WarehouseID,
		MaterialID:    params.MaterialID,
		InventoryID:   &inventoryID,
		BatchNo:       params.BatchNo,
		Quantity:      params.Quantity,
		BeforeQuantity: &beforeQuantity,
		AfterQuantity:  &afterQuantity,
		UnitPrice:     params.UnitPrice,
		RelatedOrderID: params.RelatedOrderID,
		RelatedOrderNo: params.RelatedOrderNo,
		OperatorID:    params.OperatorID,
		Remark:        params.Remark,
		IdempotentKey: idempotentKey,
	}

	if err = tx.Create(&stockRecord).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err = tx.Commit().Error; err != nil {
		return nil, err
	}

	return &StockResult{RecordNo: recordNo}, nil
}

func StockOut(params *StockOutParams) (*StockResult, error) {
	if params.Quantity <= 0 {
		return nil, errors.New("quantity must be greater than 0")
	}

	timestamp := time.Now().Unix()
	idempotentKey := generateIdempotentKey(params.BizType, params.WarehouseID, params.MaterialID, "out", timestamp)

	var existingRecord models.StockRecord
	err := database.DB.Where("idempotent_key = ?", idempotentKey).First(&existingRecord).Error
	if err == nil {
		return &StockResult{RecordNo: existingRecord.RecordNo}, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	var totalAvailable int64
	err = database.DB.Model(&models.Inventory{}).
		Where("warehouse_id = ? AND material_id = ? AND status = 1",
			params.WarehouseID, params.MaterialID).
		Select("COALESCE(SUM(available_quantity), 0)").
		Scan(&totalAvailable).Error
	if err != nil {
		return nil, err
	}
	if int(totalAvailable) < params.Quantity {
		return nil, fmt.Errorf("insufficient stock: available %d, requested %d", totalAvailable, params.Quantity)
	}

	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var inventories []models.Inventory
	err = tx.Where("warehouse_id = ? AND material_id = ? AND status = 1 AND available_quantity > 0",
		params.WarehouseID, params.MaterialID).
		Order("expiry_date IS NULL, expiry_date ASC").
		Find(&inventories).Error
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	remaining := params.Quantity
	for i := 0; i < len(inventories) && remaining > 0; i++ {
		if inventories[i].AvailableQuantity > 0 {
			takeQuantity := inventories[i].AvailableQuantity
			if takeQuantity > remaining {
				takeQuantity = remaining
			}

			beforeQuantity := inventories[i].Quantity
			inventories[i].Quantity -= takeQuantity
			inventories[i].AvailableQuantity -= takeQuantity
			afterQuantity := inventories[i].Quantity

			if err = tx.Save(&inventories[i]).Error; err != nil {
				tx.Rollback()
				return nil, err
			}

			recordNo := generateRecordNo()
			inventoryID := inventories[i].ID
			stockRecord := models.StockRecord{
				RecordNo:      recordNo,
				Type:          "out",
				BizType:       params.BizType,
				WarehouseID:   params.WarehouseID,
				MaterialID:    params.MaterialID,
				InventoryID:   &inventoryID,
				BatchNo:       inventories[i].BatchNo,
				Quantity:      takeQuantity,
				BeforeQuantity: &beforeQuantity,
				AfterQuantity:  &afterQuantity,
				UnitPrice:     inventories[i].UnitPrice,
				RelatedOrderID: params.RelatedOrderID,
				RelatedOrderNo: params.RelatedOrderNo,
				OperatorID:    params.OperatorID,
				Remark:        params.Remark,
				IdempotentKey: idempotentKey + ":" + strconv.FormatUint(inventories[i].ID, 10),
			}

			if err = tx.Create(&stockRecord).Error; err != nil {
				tx.Rollback()
				return nil, err
			}

			remaining -= takeQuantity
		}
	}

	if remaining > 0 {
		tx.Rollback()
		return nil, errors.New("failed to allocate sufficient stock")
	}

	if err = UpdateInventorySummary(tx, params.WarehouseID, params.MaterialID); err != nil {
		tx.Rollback()
		return nil, err
	}

	if err = tx.Commit().Error; err != nil {
		return nil, err
	}

	return &StockResult{RecordNo: generateRecordNo()}, nil
}

func GetStockRecordList(params *StockRecordQueryParams) (*StockRecordListResponse, error) {
	db := database.DB.Model(&models.StockRecord{})

	if params.Type != nil && *params.Type != "" {
		db = db.Where("type = ?", *params.Type)
	}
	if params.BizType != nil && *params.BizType != "" {
		db = db.Where("biz_type = ?", *params.BizType)
	}
	if params.WarehouseID != nil {
		db = db.Where("warehouse_id = ?", *params.WarehouseID)
	}
	if params.MaterialID != nil {
		db = db.Where("material_id = ?", *params.MaterialID)
	}
	if params.BatchNo != nil && *params.BatchNo != "" {
		db = db.Where("batch_no LIKE ?", "%"+*params.BatchNo+"%")
	}
	if params.OperatorID != nil {
		db = db.Where("operator_id = ?", *params.OperatorID)
	}
	if params.StartTime != nil {
		db = db.Where("operation_time >= ?", *params.StartTime)
	}
	if params.EndTime != nil {
		db = db.Where("operation_time <= ?", *params.EndTime)
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, err
	}

	page := params.Page
	if page <= 0 {
		page = 1
	}
	pageSize := params.PageSize
	if pageSize <= 0 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	var list []models.StockRecord
	err := db.Preload("Warehouse").
		Preload("Material").
		Preload("Inventory").
		Preload("Operator").
		Offset(offset).
		Limit(pageSize).
		Order("operation_time DESC").
		Find(&list).Error
	if err != nil {
		return nil, err
	}

	return &StockRecordListResponse{
		Total: total,
		List:  list,
		Page:  page,
		Size:  pageSize,
	}, nil
}
