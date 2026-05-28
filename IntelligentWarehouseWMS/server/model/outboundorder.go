package model

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type (
	OutboundOrder struct {
		Id           int64      `db:"id"`
		OrderNo      string     `db:"order_no"`
		WarehouseId  int64      `db:"warehouse_id"`
		OrderType    int64      `db:"order_type"`
		Customer     string     `db:"customer"`
		TotalQty     int64      `db:"total_qty"`
		OutboundQty  int64      `db:"outbound_qty"`
		Status       int64      `db:"status"`
		Operator     string     `db:"operator"`
		AuditTime    *time.Time `db:"audit_time"`
		CompleteTime *time.Time `db:"complete_time"`
		Remark       string     `db:"remark"`
		CreateTime   time.Time  `db:"create_time"`
		UpdateTime   time.Time  `db:"update_time"`
	}

	OutboundOrderModel interface {
		Insert(data *OutboundOrder) (sql.Result, error)
		FindOne(id int64) (*OutboundOrder, error)
		FindList(page, pageSize int, warehouseId, orderType, status int64, orderNo, customer string) ([]*OutboundOrder, error)
		Count(warehouseId, orderType, status int64, orderNo, customer string) (int64, error)
		Update(data *OutboundOrder) error
		Delete(id int64) error
	}

	defaultOutboundOrderModel struct {
		conn  sqlx.SqlConn
		table string
	}
)

func NewOutboundOrderModel(conn sqlx.SqlConn) OutboundOrderModel {
	return &defaultOutboundOrderModel{conn: conn, table: "outbound_order"}
}

func (m *defaultOutboundOrderModel) Insert(data *OutboundOrder) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (order_no, warehouse_id, order_type, customer, total_qty, outbound_qty, status, operator, audit_time, complete_time, remark, create_time, update_time) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())", m.table)
	return m.conn.Exec(query, data.OrderNo, data.WarehouseId, data.OrderType, data.Customer, data.TotalQty, data.OutboundQty, data.Status, data.Operator, data.AuditTime, data.CompleteTime, data.Remark)
}

func (m *defaultOutboundOrderModel) FindOne(id int64) (*OutboundOrder, error) {
	var resp OutboundOrder
	query := fmt.Sprintf("select id, order_no, warehouse_id, order_type, customer, total_qty, outbound_qty, status, operator, audit_time, complete_time, remark, create_time, update_time from %s where id = ? limit 1", m.table)
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

func (m *defaultOutboundOrderModel) FindList(page, pageSize int, warehouseId, orderType, status int64, orderNo, customer string) ([]*OutboundOrder, error) {
	var resp []*OutboundOrder
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
	if customer != "" {
		where = append(where, "customer like ?")
		args = append(args, "%"+customer+"%")
	}

	baseQuery := fmt.Sprintf("select id, order_no, warehouse_id, order_type, customer, total_qty, outbound_qty, status, operator, audit_time, complete_time, remark, create_time, update_time from %s", m.table)
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

func (m *defaultOutboundOrderModel) Count(warehouseId, orderType, status int64, orderNo, customer string) (int64, error) {
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
	if customer != "" {
		where = append(where, "customer like ?")
		args = append(args, "%"+customer+"%")
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

func (m *defaultOutboundOrderModel) Update(data *OutboundOrder) error {
	query := fmt.Sprintf("update %s set order_no=?, warehouse_id=?, order_type=?, customer=?, total_qty=?, outbound_qty=?, status=?, operator=?, audit_time=?, complete_time=?, remark=?, update_time=now() where id=?", m.table)
	_, err := m.conn.Exec(query, data.OrderNo, data.WarehouseId, data.OrderType, data.Customer, data.TotalQty, data.OutboundQty, data.Status, data.Operator, data.AuditTime, data.CompleteTime, data.Remark, data.Id)
	return err
}

func (m *defaultOutboundOrderModel) Delete(id int64) error {
	query := fmt.Sprintf("delete from %s where id = ?", m.table)
	_, err := m.conn.Exec(query, id)
	return err
}
