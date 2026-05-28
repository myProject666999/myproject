package services

import (
	"errors"
	"fmt"
	"time"

	"unmanned-container/config"
	"unmanned-container/models"

	"gorm.io/gorm"
)

type SaleService struct {
	inventoryService *InventoryService
}

func NewSaleService() *SaleService {
	return &SaleService{
		inventoryService: NewInventoryService(),
	}
}

func (s *SaleService) GetList(query *models.SaleQuery) ([]models.Sale, int64, error) {
	var sales []models.Sale
	var total int64

	db := config.DB.Model(&models.Sale{}).Preload("Container").Preload("Product")

	if query.ContainerID > 0 {
		db = db.Where("container_id = ?", query.ContainerID)
	}

	if query.ProductID > 0 {
		db = db.Where("product_id = ?", query.ProductID)
	}

	if query.StartDate != "" {
		db = db.Where("created_at >= ?", query.StartDate)
	}

	if query.EndDate != "" {
		db = db.Where("created_at <= ?", query.EndDate+" 23:59:59")
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

	if err := db.Offset(offset).Limit(pageSize).Order("id DESC").Find(&sales).Error; err != nil {
		return nil, 0, err
	}

	return sales, total, nil
}

func (s *SaleService) GetByID(id uint64) (*models.Sale, error) {
	var sale models.Sale
	if err := config.DB.Preload("Container").Preload("Product").First(&sale, id).Error; err != nil {
		return nil, err
	}
	return &sale, nil
}

func (s *SaleService) Create(data *models.SaleCreate) (*models.Sale, error) {
	lockKey := fmt.Sprintf("sale_lock:%s", data.OrderNo)
	locked, err := config.RedisClient.SetNX(config.Ctx, lockKey, 1, 10*time.Second).Result()
	if err != nil {
		return nil, err
	}
	if !locked {
		return nil, errors.New("order is being processed, please try again later")
	}
	defer config.RedisClient.Del(config.Ctx, lockKey)

	var existingSale models.Sale
	err = config.DB.Where("order_no = ?", data.OrderNo).First(&existingSale).Error
	if err == nil {
		return &existingSale, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	inventory, err := s.inventoryService.GetByContainerAndProduct(data.ContainerID, data.ProductID)
	if err != nil {
		return nil, err
	}

	if inventory.Quantity < data.Quantity {
		return nil, errors.New("insufficient inventory")
	}

	product, err := NewProductService().GetByID(data.ProductID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	sale := &models.Sale{
		OrderNo:     data.OrderNo,
		ContainerID: data.ContainerID,
		ProductID:   data.ProductID,
		Quantity:    data.Quantity,
		UnitPrice:   product.Price,
		TotalAmount: product.Price * float64(data.Quantity),
		PayMethod:   data.PayMethod,
		PayTime:     &now,
		Status:      1,
	}

	tx := config.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	if err := tx.Create(sale).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	newQuantity := inventory.Quantity - data.Quantity
	if err := tx.Model(&models.Inventory{}).
		Where("id = ?", inventory.ID).
		Updates(map[string]interface{}{
			"quantity":       newQuantity,
			"last_sale_time": now,
		}).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return sale, nil
}

func (s *SaleService) Refund(data *models.SaleRefund) (*models.Sale, error) {
	var sale models.Sale
	if err := config.DB.Where("order_no = ?", data.OrderNo).First(&sale).Error; err != nil {
		return nil, err
	}

	if sale.Status == 2 {
		return &sale, nil
	}

	tx := config.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	if err := tx.Model(&sale).Update("status", 2).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	inventory, err := s.inventoryService.GetByContainerAndProduct(sale.ContainerID, sale.ProductID)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	newQuantity := inventory.Quantity + sale.Quantity
	if err := tx.Model(&models.Inventory{}).
		Where("id = ?", inventory.ID).
		Update("quantity", newQuantity).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	sale.Status = 2
	return &sale, nil
}

func (s *SaleService) GetStatistics(startDate, endDate string) (*models.SaleStatistics, error) {
	var stats models.SaleStatistics

	db := config.DB.Model(&models.Sale{}).Where("status = 1")

	if startDate != "" {
		db = db.Where("created_at >= ?", startDate)
	}
	if endDate != "" {
		db = db.Where("created_at <= ?", endDate+" 23:59:59")
	}

	var totalSales *float64
	var totalOrders int64
	var totalQuantity *int64

	db.Select("COALESCE(SUM(total_amount), 0)").Scan(&totalSales)
	db.Count(&totalOrders)
	db.Select("COALESCE(SUM(quantity), 0)").Scan(&totalQuantity)

	stats.TotalSales = 0
	if totalSales != nil {
		stats.TotalSales = *totalSales
	}
	stats.TotalOrders = totalOrders
	stats.TotalQuantity = 0
	if totalQuantity != nil {
		stats.TotalQuantity = *totalQuantity
	}
	if totalOrders > 0 {
		stats.AverageOrder = stats.TotalSales / float64(totalOrders)
	}

	return &stats, nil
}

func (s *SaleService) GetContainerStats(startDate, endDate string) ([]models.ContainerSaleStats, error) {
	var stats []models.ContainerSaleStats

	db := config.DB.Table("sales s").
		Select(`s.container_id, c.container_no, c.name as container_name,
				COALESCE(SUM(s.total_amount), 0) as total_sales,
				COALESCE(SUM(s.quantity), 0) as total_quantity,
				COUNT(DISTINCT s.order_no) as order_count`).
		Joins("LEFT JOIN containers c ON s.container_id = c.id").
		Where("s.status = 1")

	if startDate != "" {
		db = db.Where("s.created_at >= ?", startDate)
	}
	if endDate != "" {
		db = db.Where("s.created_at <= ?", endDate+" 23:59:59")
	}

	if err := db.Group("s.container_id, c.container_no, c.name").
		Order("total_sales DESC").
		Find(&stats).Error; err != nil {
		return nil, err
	}

	return stats, nil
}

func (s *SaleService) GetProductStats(startDate, endDate string) ([]models.ProductSaleStats, error) {
	var stats []models.ProductSaleStats

	db := config.DB.Table("sales s").
		Select(`s.product_id, p.product_code, p.name as product_name, p.category,
				COALESCE(SUM(s.total_amount), 0) as total_sales,
				COALESCE(SUM(s.quantity), 0) as total_quantity,
				COUNT(DISTINCT s.order_no) as order_count`).
		Joins("LEFT JOIN products p ON s.product_id = p.id").
		Where("s.status = 1")

	if startDate != "" {
		db = db.Where("s.created_at >= ?", startDate)
	}
	if endDate != "" {
		db = db.Where("s.created_at <= ?", endDate+" 23:59:59")
	}

	if err := db.Group("s.product_id, p.product_code, p.name, p.category").
		Order("total_sales DESC").
		Find(&stats).Error; err != nil {
		return nil, err
	}

	return stats, nil
}
