package model

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type (
	Inventory struct {
		Id            int64      `db:"id"`
		WarehouseId   int64      `db:"warehouse_id"`
		LocationId    int64      `db:"location_id"`
		ProductId     int64      `db:"product_id"`
		Sku           string     `db:"sku"`
		Quantity      int64      `db:"quantity"`
		AvailableQty  int64      `db:"available_qty"`
		LockedQty     int64      `db:"locked_qty"`
		Version       int64      `db:"version"`
		BatchNo       string     `db:"batch_no"`
		ProductionDate *time.Time `db:"production_date"`
		ExpiryDate     *time.Time `db:"expiry_date"`
		CreateTime    time.Time  `db:"create_time"`
		UpdateTime    time.Time  `db:"update_time"`
	}

	InventoryModel interface {
		Insert(data *Inventory) (sql.Result, error)
		FindOne(id int64) (*Inventory, error)
		FindList(page, pageSize int, warehouseId, locationId, productId int64, sku string) ([]*Inventory, error)
		Count(warehouseId, locationId, productId int64, sku string) (int64, error)
		Update(data *Inventory) error
		Delete(id int64) error
		UpdateStock(id int64, quantity, availableQty, lockedQty, version int64) error
	}

	defaultInventoryModel struct {
		conn  sqlx.SqlConn
		table string
	}
)

func NewInventoryModel(conn sqlx.SqlConn) InventoryModel {
	return &defaultInventoryModel{conn: conn, table: "inventory"}
}

func (m *defaultInventoryModel) Insert(data *Inventory) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (warehouse_id, location_id, product_id, sku, quantity, available_qty, locked_qty, version, batch_no, production_date, expiry_date, create_time, update_time) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())", m.table)
	return m.conn.Exec(query, data.WarehouseId, data.LocationId, data.ProductId, data.Sku, data.Quantity, data.AvailableQty, data.LockedQty, 1, data.BatchNo, data.ProductionDate, data.ExpiryDate)
}

func (m *defaultInventoryModel) FindOne(id int64) (*Inventory, error) {
	var resp Inventory
	query := fmt.Sprintf("select id, warehouse_id, location_id, product_id, sku, quantity, available_qty, locked_qty, version, batch_no, production_date, expiry_date, create_time, update_time from %s where id = ? limit 1", m.table)
	err := m.conn.QueryRow(&resp, query, id)
	switch {
	case err == nil:
		return &resp, nil
	case strings.Contains(err.Error(), "not found"):
		return nil, ErrNotFound
	default:
		return nil, err
	}
}

func (m *defaultInventoryModel) FindList(page, pageSize int, warehouseId, locationId, productId int64, sku string) ([]*Inventory, error) {
	var resp []*Inventory
	offset := (page - 1) * pageSize
	var query string
	var args []interface{}
	var where []string

	if warehouseId > 0 {
		where = append(where, "warehouse_id = ?")
		args = append(args, warehouseId)
	}
	if locationId > 0 {
		where = append(where, "location_id = ?")
		args = append(args, locationId)
	}
	if productId > 0 {
		where = append(where, "product_id = ?")
		args = append(args, productId)
	}
	if sku != "" {
		where = append(where, "sku like ?")
		args = append(args, "%"+sku+"%")
	}

	baseQuery := fmt.Sprintf("select id, warehouse_id, location_id, product_id, sku, quantity, available_qty, locked_qty, version, batch_no, production_date, expiry_date, create_time, update_time from %s", m.table)
	if len(where) > 0 {
		query = baseQuery + " where " + strings.Join(where, " and ") + " order by id desc limit ?, ?"
	} else {
		query = baseQuery + " order by id desc limit ?, ?"
	}
	args = append(args, offset, pageSize)

	err := m.conn.QueryRows(&resp, query, args...)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (m *defaultInventoryModel) Count(warehouseId, locationId, productId int64, sku string) (int64, error) {
	var count int64
	var query string
	var args []interface{}
	var where []string

	if warehouseId > 0 {
		where = append(where, "warehouse_id = ?")
		args = append(args, warehouseId)
	}
	if locationId > 0 {
		where = append(where, "location_id = ?")
		args = append(args, locationId)
	}
	if productId > 0 {
		where = append(where, "product_id = ?")
		args = append(args, productId)
	}
	if sku != "" {
		where = append(where, "sku like ?")
		args = append(args, "%"+sku+"%")
	}

	baseQuery := fmt.Sprintf("select count(*) from %s", m.table)
	if len(where) > 0 {
		query = baseQuery + " where " + strings.Join(where, " and ")
	} else {
		query = baseQuery
	}

	err := m.conn.QueryRow(&count, query, args...)
	return count, err
}

func (m *defaultInventoryModel) Update(data *Inventory) error {
	query := fmt.Sprintf("update %s set warehouse_id=?, location_id=?, product_id=?, sku=?, quantity=?, available_qty=?, locked_qty=?, batch_no=?, production_date=?, expiry_date=?, update_time=now() where id=?", m.table)
	_, err := m.conn.Exec(query, data.WarehouseId, data.LocationId, data.ProductId, data.Sku, data.Quantity, data.AvailableQty, data.LockedQty, data.BatchNo, data.ProductionDate, data.ExpiryDate, data.Id)
	return err
}

func (m *defaultInventoryModel) Delete(id int64) error {
	query := fmt.Sprintf("delete from %s where id = ?", m.table)
	_, err := m.conn.Exec(query, id)
	return err
}

func (m *defaultInventoryModel) UpdateStock(id int64, quantity, availableQty, lockedQty, version int64) error {
	query := fmt.Sprintf("update %s set quantity=?, available_qty=?, locked_qty=?, version=version+1, update_time=now() where id=? and version=?", m.table)
	result, err := m.conn.Exec(query, quantity, availableQty, lockedQty, id, version)
	if err != nil {
		return err
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return fmt.Errorf("optimistic lock conflict, version mismatch")
	}
	return nil
}
