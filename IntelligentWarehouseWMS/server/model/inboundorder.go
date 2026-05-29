package model

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type (
	InboundOrder struct {
		Id          int64      `db:"id"`
		OrderNo     string     `db:"order_no"`
		WarehouseId int64      `db:"warehouse_id"`
		OrderType   int64      `db:"order_type"`
		Supplier    string     `db:"supplier"`
		TotalQty    int64      `db:"total_qty"`
		InboundQty  int64      `db:"inbound_qty"`
		Status      int64      `db:"status"`
		Operator    string     `db:"operator"`
		AuditTime   *time.Time `db:"audit_time"`
		CompleteTime *time.Time `db:"complete_time"`
		Remark      *string     `db:"remark"`
		CreateTime  time.Time  `db:"create_time"`
		UpdateTime  time.Time  `db:"update_time"`
	}

	InboundOrderModel interface {
		Insert(data *InboundOrder) (sql.Result, error)
		FindOne(id int64) (*InboundOrder, error)
		FindList(page, pageSize int, warehouseId, orderType, status int64, orderNo, supplier string) ([]*InboundOrder, error)
		Count(warehouseId, orderType, status int64, orderNo, supplier string) (int64, error)
		Update(data *InboundOrder) error
		Delete(id int64) error
	}

	defaultInboundOrderModel struct {
		conn  sqlx.SqlConn
		table string
	}
)

func NewInboundOrderModel(conn sqlx.SqlConn) InboundOrderModel {
	return &defaultInboundOrderModel{conn: conn, table: "inbound_order"}
}

func (m *defaultInboundOrderModel) Insert(data *InboundOrder) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (order_no, warehouse_id, order_type, supplier, total_qty, inbound_qty, status, operator, audit_time, complete_time, remark, create_time, update_time) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())", m.table)
	return m.conn.Exec(query, data.OrderNo, data.WarehouseId, data.OrderType, data.Supplier, data.TotalQty, data.InboundQty, data.Status, data.Operator, data.AuditTime, data.CompleteTime, data.Remark)
}

func (m *defaultInboundOrderModel) FindOne(id int64) (*InboundOrder, error) {
	var resp InboundOrder
	query := fmt.Sprintf("select id, order_no, warehouse_id, order_type, supplier, total_qty, inbound_qty, status, operator, audit_time, complete_time, remark, create_time, update_time from %s where id = ? limit 1", m.table)
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

func (m *defaultInboundOrderModel) FindList(page, pageSize int, warehouseId, orderType, status int64, orderNo, supplier string) ([]*InboundOrder, error) {
	var resp []*InboundOrder
	offset := (page - 1) * pageSize
	var query string
	var args []interface{}
	var where []string

	if warehouseId > 0 {
		where = append(where, "warehouse_id = ?")
		args = append(args, warehouseId)
	}
	if orderType > 0 {
		where = append(where, "order_type = ?")
		args = append(args, orderType)
	}
	if status > 0 {
		where = append(where, "status = ?")
		args = append(args, status)
	}
	if orderNo != "" {
		where = append(where, "order_no like ?")
		args = append(args, "%"+orderNo+"%")
	}
	if supplier != "" {
		where = append(where, "supplier like ?")
		args = append(args, "%"+supplier+"%")
	}

	baseQuery := fmt.Sprintf("select id, order_no, warehouse_id, order_type, supplier, total_qty, inbound_qty, status, operator, audit_time, complete_time, remark, create_time, update_time from %s", m.table)
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

func (m *defaultInboundOrderModel) Count(warehouseId, orderType, status int64, orderNo, supplier string) (int64, error) {
	var count int64
	var query string
	var args []interface{}
	var where []string

	if warehouseId > 0 {
		where = append(where, "warehouse_id = ?")
		args = append(args, warehouseId)
	}
	if orderType > 0 {
		where = append(where, "order_type = ?")
		args = append(args, orderType)
	}
	if status > 0 {
		where = append(where, "status = ?")
		args = append(args, status)
	}
	if orderNo != "" {
		where = append(where, "order_no like ?")
		args = append(args, "%"+orderNo+"%")
	}
	if supplier != "" {
		where = append(where, "supplier like ?")
		args = append(args, "%"+supplier+"%")
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

func (m *defaultInboundOrderModel) Update(data *InboundOrder) error {
	query := fmt.Sprintf("update %s set order_no=?, warehouse_id=?, order_type=?, supplier=?, total_qty=?, inbound_qty=?, status=?, operator=?, audit_time=?, complete_time=?, remark=?, update_time=now() where id=?", m.table)
	_, err := m.conn.Exec(query, data.OrderNo, data.WarehouseId, data.OrderType, data.Supplier, data.TotalQty, data.InboundQty, data.Status, data.Operator, data.AuditTime, data.CompleteTime, data.Remark, data.Id)
	return err
}

func (m *defaultInboundOrderModel) Delete(id int64) error {
	query := fmt.Sprintf("delete from %s where id = ?", m.table)
	_, err := m.conn.Exec(query, id)
	return err
}
