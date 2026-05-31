package service

import (
	"emergency-material/internal/database"
	"emergency-material/internal/models"
	"errors"

	"gorm.io/gorm"
)

type InventoryQueryParams struct {
	WarehouseID *uint64 `json:"warehouse_id"`
	MaterialID  *uint64 `json:"material_id"`
	BatchNo     *string `json:"batch_no"`
	Page        int     `json:"page"`
	PageSize    int     `json:"page_size"`
}

type InventoryListResponse struct {
	Total int64              `json:"total"`
	List  []models.Inventory `json:"list"`
	Page  int                `json:"page"`
	Size  int                `json:"size"`
}

type InventorySummaryQueryParams struct {
	WarehouseID     *uint64 `json:"warehouse_id"`
	MaterialID      *uint64 `json:"material_id"`
	IsBelowWarning  *int8   `json:"is_below_warning"`
	Page            int     `json:"page"`
	PageSize        int     `json:"page_size"`
}

type InventorySummaryListResponse struct {
	Total int64                     `json:"total"`
	List  []models.InventorySummary `json:"list"`
	Page  int                       `json:"page"`
	Size  int                       `json:"size"`
}

func GetInventoryList(params *InventoryQueryParams) (*InventoryListResponse, error) {
	db := database.DB.Model(&models.Inventory{})

	if params.WarehouseID != nil {
		db = db.Where("warehouse_id = ?", *params.WarehouseID)
	}
	if params.MaterialID != nil {
		db = db.Where("material_id = ?", *params.MaterialID)
	}
	if params.BatchNo != nil && *params.BatchNo != "" {
		db = db.Where("batch_no LIKE ?", "%"+*params.BatchNo+"%")
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

	var list []models.Inventory
	err := db.Preload("Warehouse").
		Preload("Material").
		Preload("Material.Category").
		Offset(offset).
		Limit(pageSize).
		Order("id DESC").
		Find(&list).Error
	if err != nil {
		return nil, err
	}

	return &InventoryListResponse{
		Total: total,
		List:  list,
		Page:  page,
		Size:  pageSize,
	}, nil
}

func GetInventorySummary(params *InventorySummaryQueryParams) (*InventorySummaryListResponse, error) {
	db := database.DB.Model(&models.InventorySummary{})

	if params.WarehouseID != nil {
		db = db.Where("warehouse_id = ?", *params.WarehouseID)
	}
	if params.MaterialID != nil {
		db = db.Where("material_id = ?", *params.MaterialID)
	}
	if params.IsBelowWarning != nil {
		db = db.Where("is_below_warning = ?", *params.IsBelowWarning)
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

	var list []models.InventorySummary
	err := db.Preload("Warehouse").
		Preload("Material").
		Preload("Material.Category").
		Offset(offset).
		Limit(pageSize).
		Order("id DESC").
		Find(&list).Error
	if err != nil {
		return nil, err
	}

	return &InventorySummaryListResponse{
		Total: total,
		List:  list,
		Page:  page,
		Size:  pageSize,
	}, nil
}

func GetInventoryDetail(id uint64) (*models.Inventory, error) {
	var inventory models.Inventory
	err := database.DB.Preload("Warehouse").
		Preload("Material").
		Preload("Material.Category").
		Where("id = ?", id).
		First(&inventory).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("inventory record not found")
		}
		return nil, err
	}
	return &inventory, nil
}

func UpdateInventorySummary(tx *gorm.DB, warehouseID, materialID uint64) error {
	var totalQuantity, lockedQuantity, availableQuantity int64
	err := tx.Model(&models.Inventory{}).
		Where("warehouse_id = ? AND material_id = ?", warehouseID, materialID).
		Select("COALESCE(SUM(quantity), 0)", "COALESCE(SUM(locked_quantity), 0)", "COALESCE(SUM(available_quantity), 0)").
		Row().
		Scan(&totalQuantity, &lockedQuantity, &availableQuantity)
	if err != nil {
		return err
	}

	var warningStock int
	err = tx.Model(&models.Material{}).
		Where("id = ?", materialID).
		Select("warning_stock").
		Scan(&warningStock).Error
	if err != nil {
		return err
	}

	isBelowWarning := int8(0)
	if int(availableQuantity) < warningStock {
		isBelowWarning = 1
	}

	var summary models.InventorySummary
	err = tx.Where("warehouse_id = ? AND material_id = ?", warehouseID, materialID).
		First(&summary).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			summary = models.InventorySummary{
				WarehouseID:       warehouseID,
				MaterialID:        materialID,
				TotalQuantity:     int(totalQuantity),
				LockedQuantity:    int(lockedQuantity),
				AvailableQuantity: int(availableQuantity),
				WarningStock:      warningStock,
				IsBelowWarning:    isBelowWarning,
			}
			return tx.Create(&summary).Error
		}
		return err
	}

	summary.TotalQuantity = int(totalQuantity)
	summary.LockedQuantity = int(lockedQuantity)
	summary.AvailableQuantity = int(availableQuantity)
	summary.WarningStock = warningStock
	summary.IsBelowWarning = isBelowWarning

	return tx.Save(&summary).Error
}
