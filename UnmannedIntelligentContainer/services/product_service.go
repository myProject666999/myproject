package services

import (
	"unmanned-container/config"
	"unmanned-container/models"
)

type ProductService struct{}

func NewProductService() *ProductService {
	return &ProductService{}
}

func (s *ProductService) GetList(query *models.ProductQuery) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	db := config.DB.Model(&models.Product{})

	if query.Keyword != "" {
		keyword := "%" + query.Keyword + "%"
		db = db.Where("name LIKE ? OR product_code LIKE ?", keyword, keyword)
	}

	if query.Category != "" {
		db = db.Where("category = ?", query.Category)
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

	if err := db.Offset(offset).Limit(pageSize).Order("id DESC").Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (s *ProductService) GetAll() ([]models.Product, error) {
	var products []models.Product
	if err := config.DB.Where("status = 1").Order("id DESC").Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}

func (s *ProductService) GetByID(id uint64) (*models.Product, error) {
	var product models.Product
	if err := config.DB.First(&product, id).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (s *ProductService) Create(data *models.ProductCreate) (*models.Product, error) {
	product := &models.Product{
		ProductCode: data.ProductCode,
		Name:        data.Name,
		Category:    data.Category,
		Price:       data.Price,
		Cost:        data.Cost,
		Spec:        data.Spec,
		ImageURL:    data.ImageURL,
		Status:      data.Status,
	}
	if product.Status == 0 {
		product.Status = 1
	}
	if err := config.DB.Create(product).Error; err != nil {
		return nil, err
	}
	return product, nil
}

func (s *ProductService) Update(id uint64, data *models.ProductUpdate) (*models.Product, error) {
	product, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	updates := make(map[string]interface{})
	if data.Name != "" {
		updates["name"] = data.Name
	}
	if data.Category != "" {
		updates["category"] = data.Category
	}
	if data.Price > 0 {
		updates["price"] = data.Price
	}
	if data.Cost > 0 {
		updates["cost"] = data.Cost
	}
	if data.Spec != "" {
		updates["spec"] = data.Spec
	}
	if data.ImageURL != "" {
		updates["image_url"] = data.ImageURL
	}
	if data.Status != nil {
		updates["status"] = *data.Status
	}

	if err := config.DB.Model(product).Updates(updates).Error; err != nil {
		return nil, err
	}

	return product, nil
}

func (s *ProductService) Delete(id uint64) error {
	if err := config.DB.Delete(&models.Product{}, id).Error; err != nil {
		return err
	}
	return nil
}

func (s *ProductService) GetCategories() ([]string, error) {
	var categories []string
	if err := config.DB.Model(&models.Product{}).Distinct("category").Pluck("category", &categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}
