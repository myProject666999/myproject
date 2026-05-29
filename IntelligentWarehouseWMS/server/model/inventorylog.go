package model

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type (
	InventoryLog struct {
		Id           int64     `db:"id"`
		LogNo        string    `db:"log_no"`
		WarehouseId  int64     `db:"warehouse_id"`
		LocationId   int64     `db:"location_id"`
		ProductId    int64     `db:"product_id"`
		Sku          string    `db:"sku"`
		LogType      int64     `db:"log_type"`
		BusinessType int64    `db:"business_type"`
		BusinessNo   string    `db:"business_no"`
		BeforeQty    int64     `db:"before_qty"`
		ChangeQty    int64     `db:"change_qty"`
		AfterQty     int64     `db:"after_qty"`
		Operator     string    `db:"operator"`
		Remark       *string    `db:"remark"`
		CreateTime   time.Time `db:"create_time"`
	}

	InventoryLogModel interface {
		Insert(data *InventoryLog) (sql.Result, error)
		FindOne(id int64) (*InventoryLog, error)
		FindList(page, pageSize int, warehouseId, locationId, productId, logType, businessType int64, sku, businessNo string) ([]*InventoryLog, error)
		Count(warehouseId, locationId, productId, logType, businessType int64, sku, businessNo string) (int64, error)
		Update(data *InventoryLog) error
		Delete(id int64) error
	}

	defaultInventoryLogModel struct {
		conn  sqlx.SqlConn
		table string
	}
)

func NewInventoryLogModel(conn sqlx.SqlConn) InventoryLogModel {
	return &defaultInventoryLogModel{conn: conn, table: "inventory_log"}
}

func (m *defaultInventoryLogModel) Insert(data *InventoryLog) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (log_no, warehouse_id, location_id, product_id, sku, log_type, business_type, business_no, before_qty, change_qty, after_qty, operator, remark, create_time) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())", m.table)
	return m.conn.Exec(query, data.LogNo, data.WarehouseId, data.LocationId, data.ProductId, data.Sku, data.LogType, data.BusinessType, data.BusinessNo, data.BeforeQty, data.ChangeQty, data.AfterQty, data.Operator, data.Remark)
}

func (m *defaultInventoryLogModel) FindOne(id int64) (*InventoryLog, error) {
	var resp InventoryLog
	query := fmt.Sprintf("select id, log_no, warehouse_id, location_id, product_id, sku, log_type, business_type, business_no, before_qty, change_qty, after_qty, operator, remark, create_time from %s where id = ? limit 1", m.table)
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

func (m *defaultInventoryLogModel) FindList(page, pageSize int, warehouseId, locationId, productId, logType, businessType int64, sku, businessNo string) ([]*InventoryLog, error) {
	var resp []*InventoryLog
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
	if logType > 0 {
		where = append(where, "log_type = ?")
		args = append(args, logType)
	}
	if businessType > 0 {
		where = append(where, "business_type = ?")
		args = append(args, businessType)
	}
	if sku != "" {
		where = append(where, "sku like ?")
		args = append(args, "%"+sku+"%")
	}
	if businessNo != "" {
		where = append(where, "business_no like ?")
		args = append(args, "%"+businessNo+"%")
	}

	baseQuery := fmt.Sprintf("select id, log_no, warehouse_id, location_id, product_id, sku, log_type, business_type, business_no, before_qty, change_qty, after_qty, operator, remark, create_time from %s", m.table)
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

func (m *defaultInventoryLogModel) Count(warehouseId, locationId, productId, logType, businessType int64, sku, businessNo string) (int64, error) {
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
	if logType > 0 {
		where = append(where, "log_type = ?")
		args = append(args, logType)
	}
	if businessType > 0 {
		where = append(where, "business_type = ?")
		args = append(args, businessType)
	}
	if sku != "" {
		where = append(where, "sku like ?")
		args = append(args, "%"+sku+"%")
	}
	if businessNo != "" {
		where = append(where, "business_no like ?")
		args = append(args, "%"+businessNo+"%")
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

func (m *defaultInventoryLogModel) Update(data *InventoryLog) error {
	query := fmt.Sprintf("update %s set log_no=?, warehouse_id=?, location_id=?, product_id=?, sku=?, log_type=?, business_type=?, business_no=?, before_qty=?, change_qty=?, after_qty=?, operator=?, remark=? where id=?", m.table)
	_, err := m.conn.Exec(query, data.LogNo, data.WarehouseId, data.LocationId, data.ProductId, data.Sku, data.LogType, data.BusinessType, data.BusinessNo, data.BeforeQty, data.ChangeQty, data.AfterQty, data.Operator, data.Remark, data.Id)
	return err
}

func (m *defaultInventoryLogModel) Delete(id int64) error {
	query := fmt.Sprintf("delete from %s where id = ?", m.table)
	_, err := m.conn.Exec(query, id)
	return err
}
