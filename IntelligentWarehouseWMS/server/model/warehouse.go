package model

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type (
	Warehouse struct {
		Id            int64     `db:"id"`
		WarehouseCode string    `db:"warehouse_code"`
		WarehouseName string    `db:"warehouse_name"`
		Address       string    `db:"address"`
		Manager       string    `db:"manager"`
		Phone         string    `db:"phone"`
		Status        int64     `db:"status"`
		Remark        string    `db:"remark"`
		CreateTime    time.Time `db:"create_time"`
		UpdateTime    time.Time `db:"update_time"`
	}

	WarehouseQuery struct {
		WarehouseCode string
		WarehouseName string
		Status        *int64
	}

	WarehouseModel interface {
		Insert(data *Warehouse) (sql.Result, error)
		FindOne(id int64) (*Warehouse, error)
		FindList(page, pageSize int, query *WarehouseQuery) ([]*Warehouse, error)
		Count(query *WarehouseQuery) (int64, error)
		Update(data *Warehouse) error
		Delete(id int64) error
	}

	defaultWarehouseModel struct {
		conn  sqlx.SqlConn
		table string
	}
)

func NewWarehouseModel(conn sqlx.SqlConn) WarehouseModel {
	return &defaultWarehouseModel{conn: conn, table: "warehouse"}
}

func (m *defaultWarehouseModel) Insert(data *Warehouse) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (warehouse_code, warehouse_name, address, manager, phone, status, remark, create_time, update_time) values (?, ?, ?, ?, ?, ?, ?, now(), now())", m.table)
	return m.conn.Exec(query, data.WarehouseCode, data.WarehouseName, data.Address, data.Manager, data.Phone, data.Status, data.Remark)
}

func (m *defaultWarehouseModel) FindOne(id int64) (*Warehouse, error) {
	var resp Warehouse
	query := fmt.Sprintf("select id, warehouse_code, warehouse_name, address, manager, phone, status, remark, create_time, update_time from %s where id = ? limit 1", m.table)
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

func (m *defaultWarehouseModel) buildQueryCondition(query *WarehouseQuery) (string, []interface{}) {
	var conditions []string
	var args []interface{}

	if query != nil {
		if query.WarehouseCode != "" {
			conditions = append(conditions, "warehouse_code like ?")
			args = append(args, "%"+query.WarehouseCode+"%")
		}
		if query.WarehouseName != "" {
			conditions = append(conditions, "warehouse_name like ?")
			args = append(args, "%"+query.WarehouseName+"%")
		}
		if query.Status != nil {
			conditions = append(conditions, "status = ?")
			args = append(args, *query.Status)
		}
	}

	if len(conditions) > 0 {
		return " where " + strings.Join(conditions, " and "), args
	}
	return "", nil
}

func (m *defaultWarehouseModel) FindList(page, pageSize int, query *WarehouseQuery) ([]*Warehouse, error) {
	var resp []*Warehouse
	offset := (page - 1) * pageSize

	condition, args := m.buildQueryCondition(query)
	baseQuery := fmt.Sprintf("select id, warehouse_code, warehouse_name, address, manager, phone, status, remark, create_time, update_time from %s", m.table)
	sqlQuery := fmt.Sprintf("%s%s order by id desc limit ?, ?", baseQuery, condition)
	args = append(args, offset, pageSize)

	err := m.conn.QueryRows(&resp, sqlQuery, args...)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (m *defaultWarehouseModel) Count(query *WarehouseQuery) (int64, error) {
	var count int64
	condition, args := m.buildQueryCondition(query)
	sqlQuery := fmt.Sprintf("select count(*) from %s%s", m.table, condition)

	err := m.conn.QueryRow(&count, sqlQuery, args...)
	return count, err
}

func (m *defaultWarehouseModel) Update(data *Warehouse) error {
	query := fmt.Sprintf("update %s set warehouse_code=?, warehouse_name=?, address=?, manager=?, phone=?, status=?, remark=?, update_time=now() where id=?", m.table)
	_, err := m.conn.Exec(query, data.WarehouseCode, data.WarehouseName, data.Address, data.Manager, data.Phone, data.Status, data.Remark, data.Id)
	return err
}

func (m *defaultWarehouseModel) Delete(id int64) error {
	query := fmt.Sprintf("delete from %s where id = ?", m.table)
	_, err := m.conn.Exec(query, id)
	return err
}
