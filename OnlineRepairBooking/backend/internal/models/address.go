package models

import (
	"database/sql"
	"time"
)

const AddressTableName = "addresses"

type Address struct {
	ID        uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID    uint64    `json:"user_id" gorm:"type:bigint;not null;index"`
	Name      string    `json:"name" gorm:"type:varchar(50);not null"`
	Phone     string    `json:"phone" gorm:"type:varchar(20);not null"`
	Province  string    `json:"province" gorm:"type:varchar(50)"`
	City      string    `json:"city" gorm:"type:varchar(50)"`
	District  string    `json:"district" gorm:"type:varchar(50)"`
	Detail    string    `json:"detail" gorm:"type:varchar(500);not null"`
	FullAddress string  `json:"full_address" gorm:"type:varchar(600);not null"`
	Longitude float64   `json:"longitude" gorm:"type:decimal(10,7)"`
	Latitude  float64   `json:"latitude" gorm:"type:decimal(10,7)"`
	IsDefault int       `json:"is_default" gorm:"type:tinyint;not null;default:0"`
	Tag       string    `json:"tag" gorm:"type:varchar(20)"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type AddressModel struct {
	db *sql.DB
}

func NewAddressModel(db *sql.DB) *AddressModel {
	return &AddressModel{db: db}
}

func (m *AddressModel) Create(address *Address) error {
	query := `INSERT INTO ` + AddressTableName + ` (user_id, name, phone, province, city, district, detail, full_address, longitude, latitude, is_default, tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	result, err := m.db.Exec(query, address.UserID, address.Name, address.Phone, address.Province, address.City, address.District, address.Detail, address.FullAddress, address.Longitude, address.Latitude, address.IsDefault, address.Tag)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	address.ID = uint64(id)
	return nil
}

func (m *AddressModel) GetByID(id uint64) (*Address, error) {
	query := `SELECT id, user_id, name, phone, province, city, district, detail, full_address, longitude, latitude, is_default, tag, created_at, updated_at FROM ` + AddressTableName + ` WHERE id = ?`
	row := m.db.QueryRow(query, id)
	address := &Address{}
	err := row.Scan(&address.ID, &address.UserID, &address.Name, &address.Phone, &address.Province, &address.City, &address.District, &address.Detail, &address.FullAddress, &address.Longitude, &address.Latitude, &address.IsDefault, &address.Tag, &address.CreatedAt, &address.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return address, nil
}

func (m *AddressModel) Update(address *Address) error {
	query := `UPDATE ` + AddressTableName + ` SET name = ?, phone = ?, province = ?, city = ?, district = ?, detail = ?, full_address = ?, longitude = ?, latitude = ?, is_default = ?, tag = ? WHERE id = ?`
	_, err := m.db.Exec(query, address.Name, address.Phone, address.Province, address.City, address.District, address.Detail, address.FullAddress, address.Longitude, address.Latitude, address.IsDefault, address.Tag, address.ID)
	return err
}

func (m *AddressModel) Delete(id uint64) error {
	query := `DELETE FROM ` + AddressTableName + ` WHERE id = ?`
	_, err := m.db.Exec(query, id)
	return err
}

func (m *AddressModel) SetDefault(id uint64, userID uint64) error {
	tx, err := m.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(`UPDATE `+AddressTableName+` SET is_default = 0 WHERE user_id = ?`, userID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`UPDATE `+AddressTableName+` SET is_default = 1 WHERE id = ? AND user_id = ?`, id, userID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (m *AddressModel) ListByUserID(userID uint64) ([]*Address, error) {
	query := `SELECT id, user_id, name, phone, province, city, district, detail, full_address, longitude, latitude, is_default, tag, created_at, updated_at FROM ` + AddressTableName + ` WHERE user_id = ? ORDER BY is_default DESC, id DESC`
	rows, err := m.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	addresses := make([]*Address, 0)
	for rows.Next() {
		address := &Address{}
		err := rows.Scan(&address.ID, &address.UserID, &address.Name, &address.Phone, &address.Province, &address.City, &address.District, &address.Detail, &address.FullAddress, &address.Longitude, &address.Latitude, &address.IsDefault, &address.Tag, &address.CreatedAt, &address.UpdatedAt)
		if err != nil {
			return nil, err
		}
		addresses = append(addresses, address)
	}
	return addresses, nil
}

func (m *AddressModel) GetDefault(userID uint64) (*Address, error) {
	query := `SELECT id, user_id, name, phone, province, city, district, detail, full_address, longitude, latitude, is_default, tag, created_at, updated_at FROM ` + AddressTableName + ` WHERE user_id = ? AND is_default = 1 LIMIT 1`
	row := m.db.QueryRow(query, userID)
	address := &Address{}
	err := row.Scan(&address.ID, &address.UserID, &address.Name, &address.Phone, &address.Province, &address.City, &address.District, &address.Detail, &address.FullAddress, &address.Longitude, &address.Latitude, &address.IsDefault, &address.Tag, &address.CreatedAt, &address.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return address, nil
}
