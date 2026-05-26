package repository

import (
	"errors"

	"gorm.io/gorm"

	"github.com/onlinemall/backend/internal/model"
)

var ErrDBNotConnected = errors.New("数据库未连接")

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) checkDB() error {
	if r.db == nil {
		return ErrDBNotConnected
	}
	return nil
}

func (r *UserRepository) GetByID(id uint64) (*model.User, error) {
	if err := r.checkDB(); err != nil {
		return nil, err
	}
	var user model.User
	err := r.db.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByUsername(username string) (*model.User, error) {
	if err := r.checkDB(); err != nil {
		return nil, err
	}
	var user model.User
	err := r.db.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) List(page, pageSize int) ([]model.User, int64, error) {
	if err := r.checkDB(); err != nil {
		return nil, 0, err
	}
	var users []model.User
	var total int64

	offset := (page - 1) * pageSize
	err := r.db.Model(&model.User{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = r.db.Offset(offset).Limit(pageSize).Find(&users).Error
	if err != nil {
		return nil, 0, err
	}
	return users, total, nil
}

type PointsAccountRepository struct {
	db *gorm.DB
}

func NewPointsAccountRepository(db *gorm.DB) *PointsAccountRepository {
	return &PointsAccountRepository{db: db}
}

func (r *PointsAccountRepository) checkDB() error {
	if r.db == nil {
		return ErrDBNotConnected
	}
	return nil
}

func (r *PointsAccountRepository) GetByUserID(userID uint64) (*model.PointsAccount, error) {
	if err := r.checkDB(); err != nil {
		return nil, err
	}
	var account model.PointsAccount
	err := r.db.Where("user_id = ?", userID).First(&account).Error
	if err != nil {
		return nil, err
	}
	return &account, nil
}

func (r *PointsAccountRepository) Create(account *model.PointsAccount) error {
	if err := r.checkDB(); err != nil {
		return err
	}
	return r.db.Create(account).Error
}

func (r *PointsAccountRepository) Update(account *model.PointsAccount) error {
	if err := r.checkDB(); err != nil {
		return err
	}
	return r.db.Save(account).Error
}

type PointsRuleRepository struct {
	db *gorm.DB
}

func NewPointsRuleRepository(db *gorm.DB) *PointsRuleRepository {
	return &PointsRuleRepository{db: db}
}

func (r *PointsRuleRepository) checkDB() error {
	if r.db == nil {
		return ErrDBNotConnected
	}
	return nil
}

func (r *PointsRuleRepository) GetByCode(code string) (*model.PointsRule, error) {
	if err := r.checkDB(); err != nil {
		return nil, err
	}
	var rule model.PointsRule
	err := r.db.Where("rule_code = ?", code).First(&rule).Error
	if err != nil {
		return nil, err
	}
	return &rule, nil
}

func (r *PointsRuleRepository) List() ([]model.PointsRule, error) {
	if err := r.checkDB(); err != nil {
		return nil, err
	}
	var rules []model.PointsRule
	err := r.db.Where("status = 1").Find(&rules).Error
	return rules, err
}

type PointsDetailRepository struct {
	db *gorm.DB
}

func NewPointsDetailRepository(db *gorm.DB) *PointsDetailRepository {
	return &PointsDetailRepository{db: db}
}

func (r *PointsDetailRepository) checkDB() error {
	if r.db == nil {
		return ErrDBNotConnected
	}
	return nil
}

func (r *PointsDetailRepository) Create(detail *model.PointsDetail) error {
	if err := r.checkDB(); err != nil {
		return err
	}
	return r.db.Create(detail).Error
}

func (r *PointsDetailRepository) ListByUserID(userID uint64, page, pageSize int) ([]model.PointsDetail, int64, error) {
	if err := r.checkDB(); err != nil {
		return nil, 0, err
	}
	var details []model.PointsDetail
	var total int64

	offset := (page - 1) * pageSize
	query := r.db.Model(&model.PointsDetail{}).Where("user_id = ?", userID)
	query.Count(&total)
	err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&details).Error
	return details, total, err
}

func (r *PointsDetailRepository) CountTodayByRuleCode(userID uint64, ruleCode string) (int64, error) {
	if err := r.checkDB(); err != nil {
		return 0, err
	}
	var count int64
	err := r.db.Model(&model.PointsDetail{}).
		Where("user_id = ? AND rule_code = ? AND DATE(created_at) = CURDATE()", userID, ruleCode).
		Count(&count).Error
	return count, err
}

type ProductRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) checkDB() error {
	if r.db == nil {
		return ErrDBNotConnected
	}
	return nil
}

func (r *ProductRepository) GetByID(id uint64) (*model.Product, error) {
	if err := r.checkDB(); err != nil {
		return nil, err
	}
	var product model.Product
	err := r.db.Where("id = ?", id).First(&product).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *ProductRepository) List(page, pageSize int, categoryID uint64) ([]model.Product, int64, error) {
	if err := r.checkDB(); err != nil {
		return nil, 0, err
	}
	var products []model.Product
	var total int64

	query := r.db.Model(&model.Product{}).Where("status = 1")
	if categoryID > 0 {
		query = query.Where("category_id = ?", categoryID)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	err := query.Order("sort_order ASC").Offset(offset).Limit(pageSize).Find(&products).Error
	return products, total, err
}

func (r *ProductRepository) ListAll() ([]model.Product, error) {
	if err := r.checkDB(); err != nil {
		return nil, err
	}
	var products []model.Product
	err := r.db.Where("status = 1").Order("sort_order ASC").Find(&products).Error
	return products, err
}

type ProductStockRepository struct {
	db *gorm.DB
}

func NewProductStockRepository(db *gorm.DB) *ProductStockRepository {
	return &ProductStockRepository{db: db}
}

func (r *ProductStockRepository) checkDB() error {
	if r.db == nil {
		return ErrDBNotConnected
	}
	return nil
}

func (r *ProductStockRepository) GetByProductID(productID uint64) (*model.ProductStock, error) {
	if err := r.checkDB(); err != nil {
		return nil, err
	}
	var stock model.ProductStock
	err := r.db.Where("product_id = ?", productID).First(&stock).Error
	if err != nil {
		return nil, err
	}
	return &stock, nil
}

func (r *ProductStockRepository) Update(stock *model.ProductStock) error {
	if err := r.checkDB(); err != nil {
		return err
	}
	return r.db.Save(stock).Error
}

type ProductCategoryRepository struct {
	db *gorm.DB
}

func NewProductCategoryRepository(db *gorm.DB) *ProductCategoryRepository {
	return &ProductCategoryRepository{db: db}
}

func (r *ProductCategoryRepository) checkDB() error {
	if r.db == nil {
		return ErrDBNotConnected
	}
	return nil
}

func (r *ProductCategoryRepository) List() ([]model.ProductCategory, error) {
	if err := r.checkDB(); err != nil {
		return nil, err
	}
	var categories []model.ProductCategory
	err := r.db.Where("status = 1").Order("sort_order ASC").Find(&categories).Error
	return categories, err
}

type OrderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) checkDB() error {
	if r.db == nil {
		return ErrDBNotConnected
	}
	return nil
}

func (r *OrderRepository) Create(order *model.RedemptionOrder) error {
	if err := r.checkDB(); err != nil {
		return err
	}
	return r.db.Create(order).Error
}

func (r *OrderRepository) GetByID(id uint64) (*model.RedemptionOrder, error) {
	if err := r.checkDB(); err != nil {
		return nil, err
	}
	var order model.RedemptionOrder
	err := r.db.Where("id = ?", id).First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepository) GetByOrderNo(orderNo string) (*model.RedemptionOrder, error) {
	if err := r.checkDB(); err != nil {
		return nil, err
	}
	var order model.RedemptionOrder
	err := r.db.Where("order_no = ?", orderNo).First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepository) ListByUserID(userID uint64, page, pageSize int) ([]model.RedemptionOrder, int64, error) {
	if err := r.checkDB(); err != nil {
		return nil, 0, err
	}
	var orders []model.RedemptionOrder
	var total int64

	offset := (page - 1) * pageSize
	query := r.db.Model(&model.RedemptionOrder{}).Where("user_id = ?", userID)
	query.Count(&total)
	err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&orders).Error
	return orders, total, err
}

func (r *OrderRepository) List(page, pageSize int, status int8) ([]model.RedemptionOrder, int64, error) {
	if err := r.checkDB(); err != nil {
		return nil, 0, err
	}
	var orders []model.RedemptionOrder
	var total int64

	offset := (page - 1) * pageSize
	query := r.db.Model(&model.RedemptionOrder{})
	if status >= 0 {
		query = query.Where("status = ?", status)
	}
	query.Count(&total)
	err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&orders).Error
	return orders, total, err
}

func (r *OrderRepository) Update(order *model.RedemptionOrder) error {
	if err := r.checkDB(); err != nil {
		return err
	}
	return r.db.Save(order).Error
}
