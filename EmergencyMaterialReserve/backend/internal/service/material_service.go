package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"emergency-material/internal/database"
	"emergency-material/internal/models"

	"gorm.io/gorm"
)

type MaterialService struct{}

func NewMaterialService() *MaterialService {
	return &MaterialService{}
}

type CreateMaterialRequest struct {
	Code           string  `json:"code"`
	Name           string  `json:"name"`
	CategoryID     *uint64 `json:"category_id"`
	Specification  string  `json:"specification"`
	Unit           string  `json:"unit"`
	WarningStock   int     `json:"warning_stock"`
	EmergencyLevel string  `json:"emergency_level"`
	Description    *string `json:"description"`
	OperatorID     uint64  `json:"operator_id"`
	OperatorName   string  `json:"operator_name"`
}

type UpdateMaterialRequest struct {
	ID             uint64  `json:"id"`
	Name           string  `json:"name"`
	CategoryID     *uint64 `json:"category_id"`
	Specification  string  `json:"specification"`
	Unit           string  `json:"unit"`
	WarningStock   int     `json:"warning_stock"`
	EmergencyLevel string  `json:"emergency_level"`
	Description    *string `json:"description"`
	Status         int8    `json:"status"`
	OperatorID     uint64  `json:"operator_id"`
	OperatorName   string  `json:"operator_name"`
}

type MaterialQuery struct {
	Page         int      `json:"page"`
	PageSize     int      `json:"page_size"`
	Code         string   `json:"code"`
	Name         string   `json:"name"`
	CategoryID   *uint64  `json:"category_id"`
	Status       *int8    `json:"status"`
	EmergencyLevel string `json:"emergency_level"`
}

type MaterialListResponse struct {
	Total int64            `json:"total"`
	List  []models.Material `json:"list"`
}

func (s *MaterialService) CreateMaterial(ctx context.Context, req *CreateMaterialRequest) (*models.Material, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var existing models.Material
	if err := tx.Where("code = ?", req.Code).First(&existing).Error; err == nil {
		tx.Rollback()
		return nil, errors.New("物资编码已存在")
	}

	if req.CategoryID != nil && *req.CategoryID > 0 {
		var category models.MaterialCategory
		if err := tx.First(&category, *req.CategoryID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("物资分类不存在: %w", err)
		}
	}

	material := &models.Material{
		Code:           req.Code,
		Name:           req.Name,
		CategoryID:     req.CategoryID,
		Specification:  req.Specification,
		Unit:           req.Unit,
		WarningStock:   req.WarningStock,
		EmergencyLevel: req.EmergencyLevel,
		Description:    req.Description,
		Status:         1,
	}

	if err := tx.Create(material).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("创建物资失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.OperatorID, req.OperatorName, "material", "create", req.Code, material.ID, 1, ""); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return material, nil
}

func (s *MaterialService) UpdateMaterial(ctx context.Context, req *UpdateMaterialRequest) (*models.Material, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var material models.Material
	if err := tx.First(&material, req.ID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("物资不存在: %w", err)
	}

	if req.CategoryID != nil && *req.CategoryID > 0 {
		var category models.MaterialCategory
		if err := tx.First(&category, *req.CategoryID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("物资分类不存在: %w", err)
		}
	}

	material.Name = req.Name
	material.CategoryID = req.CategoryID
	material.Specification = req.Specification
	material.Unit = req.Unit
	material.WarningStock = req.WarningStock
	material.EmergencyLevel = req.EmergencyLevel
	material.Description = req.Description
	material.Status = req.Status

	if err := tx.Save(&material).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("更新物资失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.OperatorID, req.OperatorName, "material", "update", material.Code, material.ID, 1, ""); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &material, nil
}

func (s *MaterialService) DeleteMaterial(ctx context.Context, id uint64, operatorID uint64, operatorName string) error {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var material models.Material
	if err := tx.First(&material, id).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("物资不存在: %w", err)
	}

	var invCount int64
	if err := tx.Model(&models.Inventory{}).Where("material_id = ?", id).Count(&invCount).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("检查库存失败: %w", err)
	}
	if invCount > 0 {
		tx.Rollback()
		return errors.New("该物资存在库存，无法删除")
	}

	if err := tx.Delete(&material).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("删除物资失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, operatorID, operatorName, "material", "delete", material.Code, material.ID, 1, ""); err != nil {
		tx.Rollback()
		return fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

func (s *MaterialService) GetMaterialList(ctx context.Context, query *MaterialQuery) (*MaterialListResponse, error) {
	db := database.DB.Model(&models.Material{}).Preload("Category")

	if query.Code != "" {
		db = db.Where("code LIKE ?", "%"+query.Code+"%")
	}
	if query.Name != "" {
		db = db.Where("name LIKE ?", "%"+query.Name+"%")
	}
	if query.CategoryID != nil {
		db = db.Where("category_id = ?", *query.CategoryID)
	}
	if query.Status != nil {
		db = db.Where("status = ?", *query.Status)
	}
	if query.EmergencyLevel != "" {
		db = db.Where("emergency_level = ?", query.EmergencyLevel)
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, err
	}

	page := query.Page
	if page <= 0 {
		page = 1
	}
	pageSize := query.PageSize
	if pageSize <= 0 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	var list []models.Material
	if err := db.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, err
	}

	return &MaterialListResponse{
		Total: total,
		List:  list,
	}, nil
}

func (s *MaterialService) GetMaterialDetail(ctx context.Context, id uint64) (*models.Material, error) {
	var material models.Material
	if err := database.DB.Preload("Category").First(&material, id).Error; err != nil {
		return nil, fmt.Errorf("物资不存在: %w", err)
	}
	return &material, nil
}

type CreateWarehouseRequest struct {
	Code      string   `json:"code"`
	Name      string   `json:"name"`
	Province  string   `json:"province"`
	City      string   `json:"city"`
	District  string   `json:"district"`
	Address   string   `json:"address"`
	Longitude *float64 `json:"longitude"`
	Latitude  *float64 `json:"latitude"`
	ManagerID *uint64  `json:"manager_id"`
	Capacity  *float64 `json:"capacity"`
	Remark    *string  `json:"remark"`
	OperatorID uint64  `json:"operator_id"`
	OperatorName string `json:"operator_name"`
}

type UpdateWarehouseRequest struct {
	ID          uint64   `json:"id"`
	Name        string   `json:"name"`
	Province    string   `json:"province"`
	City        string   `json:"city"`
	District    string   `json:"district"`
	Address     string   `json:"address"`
	Longitude   *float64 `json:"longitude"`
	Latitude    *float64 `json:"latitude"`
	ManagerID   *uint64  `json:"manager_id"`
	Capacity    *float64 `json:"capacity"`
	Remark      *string  `json:"remark"`
	Status      int8     `json:"status"`
	OperatorID  uint64   `json:"operator_id"`
	OperatorName string  `json:"operator_name"`
}

type WarehouseQuery struct {
	Page     int      `json:"page"`
	PageSize int      `json:"page_size"`
	Code     string   `json:"code"`
	Name     string   `json:"name"`
	City     string   `json:"city"`
	Status   *int8    `json:"status"`
}

type WarehouseListResponse struct {
	Total int64             `json:"total"`
	List  []models.Warehouse `json:"list"`
}

func (s *MaterialService) CreateWarehouse(ctx context.Context, req *CreateWarehouseRequest) (*models.Warehouse, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var existing models.Warehouse
	if err := tx.Where("code = ?", req.Code).First(&existing).Error; err == nil {
		tx.Rollback()
		return nil, errors.New("仓库编码已存在")
	}

	if req.ManagerID != nil && *req.ManagerID > 0 {
		var manager models.User
		if err := tx.First(&manager, *req.ManagerID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("管理员不存在: %w", err)
		}
	}

	warehouse := &models.Warehouse{
		Code:      req.Code,
		Name:      req.Name,
		Province:  req.Province,
		City:      req.City,
		District:  req.District,
		Address:   req.Address,
		Longitude: req.Longitude,
		Latitude:  req.Latitude,
		ManagerID: req.ManagerID,
		Capacity:  req.Capacity,
		Remark:    req.Remark,
		Status:    1,
	}

	if err := tx.Create(warehouse).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("创建仓库失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.OperatorID, req.OperatorName, "warehouse", "create", req.Code, warehouse.ID, 1, ""); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return warehouse, nil
}

func (s *MaterialService) UpdateWarehouse(ctx context.Context, req *UpdateWarehouseRequest) (*models.Warehouse, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var warehouse models.Warehouse
	if err := tx.First(&warehouse, req.ID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("仓库不存在: %w", err)
	}

	if req.ManagerID != nil && *req.ManagerID > 0 {
		var manager models.User
		if err := tx.First(&manager, *req.ManagerID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("管理员不存在: %w", err)
		}
	}

	warehouse.Name = req.Name
	warehouse.Province = req.Province
	warehouse.City = req.City
	warehouse.District = req.District
	warehouse.Address = req.Address
	warehouse.Longitude = req.Longitude
	warehouse.Latitude = req.Latitude
	warehouse.ManagerID = req.ManagerID
	warehouse.Capacity = req.Capacity
	warehouse.Remark = req.Remark
	warehouse.Status = req.Status

	if err := tx.Save(&warehouse).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("更新仓库失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.OperatorID, req.OperatorName, "warehouse", "update", warehouse.Code, warehouse.ID, 1, ""); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &warehouse, nil
}

func (s *MaterialService) DeleteWarehouse(ctx context.Context, id uint64, operatorID uint64, operatorName string) error {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var warehouse models.Warehouse
	if err := tx.First(&warehouse, id).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("仓库不存在: %w", err)
	}

	var invCount int64
	if err := tx.Model(&models.Inventory{}).Where("warehouse_id = ?", id).Count(&invCount).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("检查库存失败: %w", err)
	}
	if invCount > 0 {
		tx.Rollback()
		return errors.New("该仓库存在库存，无法删除")
	}

	if err := tx.Delete(&warehouse).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("删除仓库失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, operatorID, operatorName, "warehouse", "delete", warehouse.Code, warehouse.ID, 1, ""); err != nil {
		tx.Rollback()
		return fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

func (s *MaterialService) GetWarehouseList(ctx context.Context, query *WarehouseQuery) (*WarehouseListResponse, error) {
	db := database.DB.Model(&models.Warehouse{}).Preload("Manager")

	if query.Code != "" {
		db = db.Where("code LIKE ?", "%"+query.Code+"%")
	}
	if query.Name != "" {
		db = db.Where("name LIKE ?", "%"+query.Name+"%")
	}
	if query.City != "" {
		db = db.Where("city LIKE ?", "%"+query.City+"%")
	}
	if query.Status != nil {
		db = db.Where("status = ?", *query.Status)
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, err
	}

	page := query.Page
	if page <= 0 {
		page = 1
	}
	pageSize := query.PageSize
	if pageSize <= 0 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	var list []models.Warehouse
	if err := db.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, err
	}

	return &WarehouseListResponse{
		Total: total,
		List:  list,
	}, nil
}

func (s *MaterialService) GetWarehouseDetail(ctx context.Context, id uint64) (*models.Warehouse, error) {
	var warehouse models.Warehouse
	if err := database.DB.Preload("Manager").First(&warehouse, id).Error; err != nil {
		return nil, fmt.Errorf("仓库不存在: %w", err)
	}
	return &warehouse, nil
}

type CreateCategoryRequest struct {
	Code       string `json:"code"`
	Name       string `json:"name"`
	ParentID   uint64 `json:"parent_id"`
	SortOrder  int    `json:"sort_order"`
	OperatorID uint64 `json:"operator_id"`
	OperatorName string `json:"operator_name"`
}

type UpdateCategoryRequest struct {
	ID         uint64 `json:"id"`
	Name       string `json:"name"`
	ParentID   uint64 `json:"parent_id"`
	SortOrder  int    `json:"sort_order"`
	Status     int8   `json:"status"`
	OperatorID uint64 `json:"operator_id"`
	OperatorName string `json:"operator_name"`
}

type CategoryListResponse struct {
	List []models.MaterialCategory `json:"list"`
}

func (s *MaterialService) CreateCategory(ctx context.Context, req *CreateCategoryRequest) (*models.MaterialCategory, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var existing models.MaterialCategory
	if err := tx.Where("code = ?", req.Code).First(&existing).Error; err == nil {
		tx.Rollback()
		return nil, errors.New("分类编码已存在")
	}

	if req.ParentID > 0 {
		var parent models.MaterialCategory
		if err := tx.First(&parent, req.ParentID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("父分类不存在: %w", err)
		}
	}

	category := &models.MaterialCategory{
		Code:      req.Code,
		Name:      req.Name,
		ParentID:  req.ParentID,
		SortOrder: req.SortOrder,
		Status:    1,
	}

	if err := tx.Create(category).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("创建分类失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.OperatorID, req.OperatorName, "category", "create", req.Code, category.ID, 1, ""); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return category, nil
}

func (s *MaterialService) UpdateCategory(ctx context.Context, req *UpdateCategoryRequest) (*models.MaterialCategory, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var category models.MaterialCategory
	if err := tx.First(&category, req.ID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("分类不存在: %w", err)
	}

	if req.ParentID > 0 {
		var parent models.MaterialCategory
		if err := tx.First(&parent, req.ParentID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("父分类不存在: %w", err)
		}
	}

	category.Name = req.Name
	category.ParentID = req.ParentID
	category.SortOrder = req.SortOrder
	category.Status = req.Status

	if err := tx.Save(&category).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("更新分类失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.OperatorID, req.OperatorName, "category", "update", category.Code, category.ID, 1, ""); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &category, nil
}

func (s *MaterialService) DeleteCategory(ctx context.Context, id uint64, operatorID uint64, operatorName string) error {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var category models.MaterialCategory
	if err := tx.First(&category, id).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("分类不存在: %w", err)
	}

	var childCount int64
	if err := tx.Model(&models.MaterialCategory{}).Where("parent_id = ?", id).Count(&childCount).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("检查子分类失败: %w", err)
	}
	if childCount > 0 {
		tx.Rollback()
		return errors.New("该分类存在子分类，无法删除")
	}

	var materialCount int64
	if err := tx.Model(&models.Material{}).Where("category_id = ?", id).Count(&materialCount).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("检查物资失败: %w", err)
	}
	if materialCount > 0 {
		tx.Rollback()
		return errors.New("该分类下存在物资，无法删除")
	}

	if err := tx.Delete(&category).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("删除分类失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, operatorID, operatorName, "category", "delete", category.Code, category.ID, 1, ""); err != nil {
		tx.Rollback()
		return fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

func (s *MaterialService) GetCategoryList(ctx context.Context) (*CategoryListResponse, error) {
	var list []models.MaterialCategory
	if err := database.DB.Order("sort_order ASC, id ASC").Find(&list).Error; err != nil {
		return nil, err
	}
	return &CategoryListResponse{List: list}, nil
}

type WarehouseInventorySummary struct {
	WarehouseID       uint64  `json:"warehouse_id"`
	WarehouseName     string  `json:"warehouse_name"`
	WarehouseCode     string  `json:"warehouse_code"`
	TotalQuantity     int     `json:"total_quantity"`
	LockedQuantity    int     `json:"locked_quantity"`
	AvailableQuantity int     `json:"available_quantity"`
	TotalValue        float64 `json:"total_value"`
}

type MaterialDistributionItem struct {
	CategoryID   uint64 `json:"category_id"`
	CategoryName string `json:"category_name"`
	TotalQuantity int   `json:"total_quantity"`
	MaterialCount int   `json:"material_count"`
}

type WarningStats struct {
	BelowWarningCount   int64 `json:"below_warning_count"`
	ExpiryYellowCount   int64 `json:"expiry_yellow_count"`
	ExpiryOrangeCount   int64 `json:"expiry_orange_count"`
	ExpiryRedCount      int64 `json:"expiry_red_count"`
}

type TransferStats struct {
	PendingApprovalCount int64 `json:"pending_approval_count"`
	InTransitCount       int64 `json:"in_transit_count"`
	TodayTransferCount   int64 `json:"today_transfer_count"`
}

type DemandStats struct {
	PendingApprovalCount int64 `json:"pending_approval_count"`
	ProcessingCount      int64 `json:"processing_count"`
	TodayDemandCount     int64 `json:"today_demand_count"`
}

type DashboardData struct {
	TotalWarehouses     int64                       `json:"total_warehouses"`
	TotalMaterials      int64                       `json:"total_materials"`
	TotalInventoryQty   int                         `json:"total_inventory_qty"`
	TotalInventoryValue float64                     `json:"total_inventory_value"`
	WarehouseSummary    []WarehouseInventorySummary `json:"warehouse_summary"`
	MaterialDistribution []MaterialDistributionItem `json:"material_distribution"`
	WarningStats        WarningStats                `json:"warning_stats"`
	TransferStats       TransferStats               `json:"transfer_stats"`
	DemandStats         DemandStats                 `json:"demand_stats"`
}

func (s *MaterialService) GetDashboardData(ctx context.Context) (*DashboardData, error) {
	var totalWarehouses int64
	if err := database.DB.Model(&models.Warehouse{}).Where("status = ?", 1).Count(&totalWarehouses).Error; err != nil {
		return nil, fmt.Errorf("统计仓库数量失败: %w", err)
	}

	var totalMaterials int64
	if err := database.DB.Model(&models.Material{}).Where("status = ?", 1).Count(&totalMaterials).Error; err != nil {
		return nil, fmt.Errorf("统计物资数量失败: %w", err)
	}

	var totalQty int
	var totalValue float64
	rows, err := database.DB.Model(&models.Inventory{}).
		Select("COALESCE(SUM(quantity), 0) as total_qty, COALESCE(SUM(quantity * COALESCE(unit_price, 0)), 0) as total_value").
		Where("status = ?", 1).
		Rows()
	if err != nil {
		return nil, fmt.Errorf("统计库存总量失败: %w", err)
	}
	if rows.Next() {
		rows.Scan(&totalQty, &totalValue)
	}
	rows.Close()

	var warehouseSummary []WarehouseInventorySummary
	whRows, err := database.DB.Table("inventory_summary s").
		Select("s.warehouse_id, w.name as warehouse_name, w.code as warehouse_code, " +
			"COALESCE(SUM(s.total_quantity), 0) as total_quantity, " +
			"COALESCE(SUM(s.locked_quantity), 0) as locked_quantity, " +
			"COALESCE(SUM(s.available_quantity), 0) as available_quantity, " +
			"COALESCE(SUM(i.quantity * COALESCE(i.unit_price, 0)), 0) as total_value").
		Joins("LEFT JOIN warehouses w ON w.id = s.warehouse_id").
		Joins("LEFT JOIN inventory i ON i.warehouse_id = s.warehouse_id AND i.material_id = s.material_id").
		Where("w.status = ?", 1).
		Group("s.warehouse_id, w.name, w.code").
		Rows()
	if err != nil {
		return nil, fmt.Errorf("查询仓库库存汇总失败: %w", err)
	}
	for whRows.Next() {
		var item WarehouseInventorySummary
		whRows.Scan(&item.WarehouseID, &item.WarehouseName, &item.WarehouseCode,
			&item.TotalQuantity, &item.LockedQuantity, &item.AvailableQuantity, &item.TotalValue)
		warehouseSummary = append(warehouseSummary, item)
	}
	whRows.Close()

	var materialDistribution []MaterialDistributionItem
	distRows, err := database.DB.Table("materials m").
		Select("m.category_id, c.name as category_name, " +
			"COALESCE(SUM(s.total_quantity), 0) as total_quantity, " +
			"COUNT(DISTINCT m.id) as material_count").
		Joins("LEFT JOIN material_categories c ON c.id = m.category_id").
		Joins("LEFT JOIN inventory_summary s ON s.material_id = m.id").
		Where("m.status = ?", 1).
		Group("m.category_id, c.name").
		Rows()
	if err != nil {
		return nil, fmt.Errorf("查询物资分布失败: %w", err)
	}
	for distRows.Next() {
		var item MaterialDistributionItem
		distRows.Scan(&item.CategoryID, &item.CategoryName, &item.TotalQuantity, &item.MaterialCount)
		materialDistribution = append(materialDistribution, item)
	}
	distRows.Close()

	var warningStats WarningStats
	if err := database.DB.Model(&models.InventorySummary{}).
		Where("is_below_warning = ?", 1).Count(&warningStats.BelowWarningCount).Error; err != nil {
		return nil, fmt.Errorf("统计库存预警失败: %w", err)
	}
	if err := database.DB.Model(&models.ExpiryAlert{}).
		Where("alert_level = ? AND status = ?", "yellow", 0).Count(&warningStats.ExpiryYellowCount).Error; err != nil {
		return nil, fmt.Errorf("统计黄色预警失败: %w", err)
	}
	if err := database.DB.Model(&models.ExpiryAlert{}).
		Where("alert_level = ? AND status = ?", "orange", 0).Count(&warningStats.ExpiryOrangeCount).Error; err != nil {
		return nil, fmt.Errorf("统计橙色预警失败: %w", err)
	}
	if err := database.DB.Model(&models.ExpiryAlert{}).
		Where("alert_level = ? AND status = ?", "red", 0).Count(&warningStats.ExpiryRedCount).Error; err != nil {
		return nil, fmt.Errorf("统计红色预警失败: %w", err)
	}

	var transferStats TransferStats
	if err := database.DB.Model(&models.TransferOrder{}).
		Where("status = ?", TransferStatusPendingApproval).Count(&transferStats.PendingApprovalCount).Error; err != nil {
		return nil, fmt.Errorf("统计待审批调拨单失败: %w", err)
	}
	if err := database.DB.Model(&models.TransferOrder{}).
		Where("status = ?", TransferStatusInTransit).Count(&transferStats.InTransitCount).Error; err != nil {
		return nil, fmt.Errorf("统计运输中调拨单失败: %w", err)
	}
	today := time.Now().Format("2006-01-02")
	if err := database.DB.Model(&models.TransferOrder{}).
		Where("DATE(created_at) = ?", today).Count(&transferStats.TodayTransferCount).Error; err != nil {
		return nil, fmt.Errorf("统计今日调拨单失败: %w", err)
	}

	var demandStats DemandStats
	if err := database.DB.Model(&models.DemandRequest{}).
		Where("status = ?", DemandStatusPendingApproval).Count(&demandStats.PendingApprovalCount).Error; err != nil {
		return nil, fmt.Errorf("统计待审批需求单失败: %w", err)
	}
	if err := database.DB.Model(&models.DemandRequest{}).
		Where("status = ?", DemandStatusProcessing).Count(&demandStats.ProcessingCount).Error; err != nil {
		return nil, fmt.Errorf("统计处理中需求单失败: %w", err)
	}
	if err := database.DB.Model(&models.DemandRequest{}).
		Where("DATE(created_at) = ?", today).Count(&demandStats.TodayDemandCount).Error; err != nil {
		return nil, fmt.Errorf("统计今日需求单失败: %w", err)
	}

	return &DashboardData{
		TotalWarehouses:      totalWarehouses,
		TotalMaterials:       totalMaterials,
		TotalInventoryQty:    totalQty,
		TotalInventoryValue:  totalValue,
		WarehouseSummary:     warehouseSummary,
		MaterialDistribution: materialDistribution,
		WarningStats:         warningStats,
		TransferStats:        transferStats,
		DemandStats:          demandStats,
	}, nil
}

func (s *MaterialService) logOperation(ctx context.Context, db *gorm.DB, userID uint64, username, module, operation, bizNo string, bizID uint64, status int8, errorMsg string) error {
	log := &models.OperationLog{
		UserID:    &userID,
		Username:  username,
		Module:    module,
		Operation: operation,
		BizID:     &bizID,
		BizNo:     bizNo,
		Status:    status,
		ErrorMsg:  &errorMsg,
	}
	return db.Create(log).Error
}
