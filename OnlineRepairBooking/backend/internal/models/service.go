package models

import (
	"database/sql"
	"time"
)

const ServiceCategoryTableName = "service_categories"
const ServiceTableName = "services"

const (
	ServiceStatusActive   = 1
	ServiceStatusInactive = 0
)

type ServiceCategory struct {
	ID        uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	Name      string    `json:"name" gorm:"type:varchar(50);not null;unique"`
	Icon      string    `json:"icon" gorm:"type:varchar(255)"`
	Sort      int       `json:"sort" gorm:"type:int;default:0"`
	Status    int       `json:"status" gorm:"type:tinyint;not null;default:1"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type Service struct {
	ID          uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	CategoryID  uint64    `json:"category_id" gorm:"type:bigint;not null;index"`
	Name        string    `json:"name" gorm:"type:varchar(100);not null"`
	Description string    `json:"description" gorm:"type:text"`
	BasePrice   float64   `json:"base_price" gorm:"type:decimal(10,2);not null"`
	Image       string    `json:"image" gorm:"type:varchar(255)"`
	Unit        string    `json:"unit" gorm:"type:varchar(20)"`
	Sort        int       `json:"sort" gorm:"type:int;default:0"`
	Status      int       `json:"status" gorm:"type:tinyint;not null;default:1"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type ServiceCategoryModel struct {
	db *sql.DB
}

type ServiceModel struct {
	db *sql.DB
}

func NewServiceCategoryModel(db *sql.DB) *ServiceCategoryModel {
	return &ServiceCategoryModel{db: db}
}

func NewServiceModel(db *sql.DB) *ServiceModel {
	return &ServiceModel{db: db}
}

func (m *ServiceCategoryModel) Create(category *ServiceCategory) error {
	query := `INSERT INTO ` + ServiceCategoryTableName + ` (name, icon, sort, status) VALUES (?, ?, ?, ?)`
	result, err := m.db.Exec(query, category.Name, category.Icon, category.Sort, category.Status)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	category.ID = uint64(id)
	return nil
}

func (m *ServiceCategoryModel) GetByID(id uint64) (*ServiceCategory, error) {
	query := `SELECT id, name, icon, sort, status, created_at, updated_at FROM ` + ServiceCategoryTableName + ` WHERE id = ?`
	row := m.db.QueryRow(query, id)
	category := &ServiceCategory{}
	err := row.Scan(&category.ID, &category.Name, &category.Icon, &category.Sort, &category.Status, &category.CreatedAt, &category.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return category, nil
}

func (m *ServiceCategoryModel) Update(category *ServiceCategory) error {
	query := `UPDATE ` + ServiceCategoryTableName + ` SET name = ?, icon = ?, sort = ?, status = ? WHERE id = ?`
	_, err := m.db.Exec(query, category.Name, category.Icon, category.Sort, category.Status, category.ID)
	return err
}

func (m *ServiceCategoryModel) Delete(id uint64) error {
	query := `DELETE FROM ` + ServiceCategoryTableName + ` WHERE id = ?`
	_, err := m.db.Exec(query, id)
	return err
}

func (m *ServiceCategoryModel) List() ([]*ServiceCategory, error) {
	query := `SELECT id, name, icon, sort, status, created_at, updated_at FROM ` + ServiceCategoryTableName + ` WHERE status = 1 ORDER BY sort ASC, id DESC`
	rows, err := m.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	categories := make([]*ServiceCategory, 0)
	for rows.Next() {
		category := &ServiceCategory{}
		err := rows.Scan(&category.ID, &category.Name, &category.Icon, &category.Sort, &category.Status, &category.CreatedAt, &category.UpdatedAt)
		if err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
	return categories, nil
}

func (m *ServiceModel) Create(service *Service) error {
	query := `INSERT INTO ` + ServiceTableName + ` (category_id, name, description, base_price, image, unit, sort, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	result, err := m.db.Exec(query, service.CategoryID, service.Name, service.Description, service.BasePrice, service.Image, service.Unit, service.Sort, service.Status)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	service.ID = uint64(id)
	return nil
}

func (m *ServiceModel) GetByID(id uint64) (*Service, error) {
	query := `SELECT id, category_id, name, description, base_price, image, unit, sort, status, created_at, updated_at FROM ` + ServiceTableName + ` WHERE id = ?`
	row := m.db.QueryRow(query, id)
	service := &Service{}
	err := row.Scan(&service.ID, &service.CategoryID, &service.Name, &service.Description, &service.BasePrice, &service.Image, &service.Unit, &service.Sort, &service.Status, &service.CreatedAt, &service.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return service, nil
}

func (m *ServiceModel) Update(service *Service) error {
	query := `UPDATE ` + ServiceTableName + ` SET category_id = ?, name = ?, description = ?, base_price = ?, image = ?, unit = ?, sort = ?, status = ? WHERE id = ?`
	_, err := m.db.Exec(query, service.CategoryID, service.Name, service.Description, service.BasePrice, service.Image, service.Unit, service.Sort, service.Status, service.ID)
	return err
}

func (m *ServiceModel) Delete(id uint64) error {
	query := `DELETE FROM ` + ServiceTableName + ` WHERE id = ?`
	_, err := m.db.Exec(query, id)
	return err
}

func (m *ServiceModel) ListByCategoryID(categoryID uint64, page, pageSize int) ([]*Service, int64, error) {
	var total int64
	countQuery := `SELECT COUNT(*) FROM ` + ServiceTableName + ` WHERE category_id = ?`
	err := m.db.QueryRow(countQuery, categoryID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	query := `SELECT id, category_id, name, description, base_price, image, unit, sort, status, created_at, updated_at FROM ` + ServiceTableName + ` WHERE category_id = ? ORDER BY sort ASC, id DESC LIMIT ? OFFSET ?`
	rows, err := m.db.Query(query, categoryID, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	services := make([]*Service, 0)
	for rows.Next() {
		service := &Service{}
		err := rows.Scan(&service.ID, &service.CategoryID, &service.Name, &service.Description, &service.BasePrice, &service.Image, &service.Unit, &service.Sort, &service.Status, &service.CreatedAt, &service.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		services = append(services, service)
	}
	return services, total, nil
}
