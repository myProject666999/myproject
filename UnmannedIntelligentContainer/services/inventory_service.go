package services

import (
	"unmanned-container/config"
	"unmanned-container/models"
)

type InventoryService struct{}

func NewInventoryService() *InventoryService {
	return &InventoryService{}
}

func (s *InventoryService) GetList(query *models.InventoryQuery) ([]models.Inventory, int64, error) {
	var inventory []models.Inventory
	var total int64

	db := config.DB.Model(&models.Inventory{}).Preload("Container").Preload("Product")

	if query.ContainerID > 0 {
		db = db.Where("container_id = ?", query.ContainerID)
	}

	if query.ProductID > 0 {
		db = db.Where("product_id = ?", query.ProductID)
	}

	if query.LowStock != nil && *query.LowStock {
		db = db.Where("quantity <= threshold")
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

	if err := db.Offset(offset).Limit(pageSize).Order("id DESC").Find(&inventory).Error; err != nil {
		return nil, 0, err
	}

	return inventory, total, nil
}

func (s *InventoryService) GetByID(id uint64) (*models.Inventory, error) {
	var inventory models.Inventory
	if err := config.DB.Preload("Container").Preload("Product").First(&inventory, id).Error; err != nil {
		return nil, err
	}
	return &inventory, nil
}

func (s *InventoryService) GetByContainerAndProduct(containerID, productID uint64) (*models.Inventory, error) {
	var inventory models.Inventory
	if err := config.DB.Where("container_id = ? AND product_id = ?", containerID, productID).First(&inventory).Error; err != nil {
		return nil, err
	}
	return &inventory, nil
}

func (s *InventoryService) Create(data *models.InventoryCreate) (*models.Inventory, error) {
	inventory := &models.Inventory{
		ContainerID: data.ContainerID,
		ProductID:   data.ProductID,
		Quantity:    data.Quantity,
		MaxQuantity: data.MaxQuantity,
		Threshold:   data.Threshold,
	}
	if inventory.MaxQuantity == 0 {
		inventory.MaxQuantity = 20
	}
	if inventory.Threshold == 0 {
		inventory.Threshold = 5
	}
	if err := config.DB.Create(inventory).Error; err != nil {
		return nil, err
	}
	return inventory, nil
}

func (s *InventoryService) Update(id uint64, data *models.InventoryUpdate) (*models.Inventory, error) {
	inventory, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	updates := make(map[string]interface{})
	if data.Quantity != nil {
		updates["quantity"] = *data.Quantity
	}
	if data.MaxQuantity != nil {
		updates["max_quantity"] = *data.MaxQuantity
	}
	if data.Threshold != nil {
		updates["threshold"] = *data.Threshold
	}

	if err := config.DB.Model(inventory).Updates(updates).Error; err != nil {
		return nil, err
	}

	return inventory, nil
}

func (s *InventoryService) Delete(id uint64) error {
	if err := config.DB.Delete(&models.Inventory{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (s *InventoryService) GetLowStockItems(area string) ([]models.LowStockItem, error) {
	var items []models.LowStockItem

	sql := `SELECT i.id, i.container_id, c.container_no, c.name as container_name, c.area,
				i.product_id, p.product_code, p.name as product_name, p.category,
				i.quantity, i.threshold, i.max_quantity,
				(i.max_quantity - i.quantity) as need_quantity
			FROM inventory i
			LEFT JOIN containers c ON i.container_id = c.id
			LEFT JOIN products p ON i.product_id = p.id
			WHERE i.quantity <= i.threshold AND c.status = 1 AND p.status = 1`

	if area != "" {
		sql += " AND c.area = '" + area + "'"
	}

	sql += " ORDER BY c.area, c.id, p.id"

	if err := config.DB.Raw(sql).Scan(&items).Error; err != nil {
		return nil, err
	}

	return items, nil
}

func (s *InventoryService) UpdateQuantity(containerID, productID uint64, quantity int) error {
	return config.DB.Model(&models.Inventory{}).
		Where("container_id = ? AND product_id = ?", containerID, productID).
		Update("quantity", quantity).Error
}
