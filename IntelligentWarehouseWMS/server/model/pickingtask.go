package model

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type (
	PickingTask struct {
		Id           int64      `db:"id"`
		TaskNo       string     `db:"task_no"`
		OrderId      int64      `db:"order_id"`
		OrderItemId  int64      `db:"order_item_id"`
		WarehouseId  int64      `db:"warehouse_id"`
		ProductId    int64      `db:"product_id"`
		Sku          string     `db:"sku"`
		LocationId   int64      `db:"location_id"`
		PlanQty      int64      `db:"plan_qty"`
		PickQty      int64      `db:"pick_qty"`
		SortOrder    int64      `db:"sort_order"`
		Status       int64      `db:"status"`
		Operator     string     `db:"operator"`
		CompleteTime *time.Time `db:"complete_time"`
		Remark       *string     `db:"remark"`
		CreateTime   time.Time  `db:"create_time"`
		UpdateTime   time.Time  `db:"update_time"`
	}

	PickingTaskQuery struct {
		TaskNo      string
		OrderId     int64
		WarehouseId int64
		ProductId   int64
		Sku         string
		LocationId  int64
		Status      *int64
		Operator    string
	}

	PickingTaskModel interface {
		Insert(data *PickingTask) (sql.Result, error)
		FindOne(id int64) (*PickingTask, error)
		FindList(page, pageSize int, query *PickingTaskQuery) ([]*PickingTask, error)
		Count(query *PickingTaskQuery) (int64, error)
		Update(data *PickingTask) error
		Delete(id int64) error
	}

	defaultPickingTaskModel struct {
		conn  sqlx.SqlConn
		table string
	}
)

func NewPickingTaskModel(conn sqlx.SqlConn) PickingTaskModel {
	return &defaultPickingTaskModel{conn: conn, table: "picking_task"}
}

func (m *defaultPickingTaskModel) Insert(data *PickingTask) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (task_no, order_id, order_item_id, warehouse_id, product_id, sku, location_id, plan_qty, pick_qty, sort_order, status, operator, complete_time, remark, create_time, update_time) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())", m.table)
	return m.conn.Exec(query, data.TaskNo, data.OrderId, data.OrderItemId, data.WarehouseId, data.ProductId, data.Sku, data.LocationId, data.PlanQty, data.PickQty, data.SortOrder, data.Status, data.Operator, data.CompleteTime, data.Remark)
}

func (m *defaultPickingTaskModel) FindOne(id int64) (*PickingTask, error) {
	var resp PickingTask
	query := fmt.Sprintf("select id, task_no, order_id, order_item_id, warehouse_id, product_id, sku, location_id, plan_qty, pick_qty, sort_order, status, operator, complete_time, remark, create_time, update_time from %s where id = ? limit 1", m.table)
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

func (m *defaultPickingTaskModel) buildQueryCondition(query *PickingTaskQuery) (string, []interface{}) {
	var conditions []string
	var args []interface{}

	if query != nil {
		if query.TaskNo != "" {
			conditions = append(conditions, "task_no like ?")
			args = append(args, "%"+query.TaskNo+"%")
		}
		if query.OrderId > 0 {
			conditions = append(conditions, "order_id = ?")
			args = append(args, query.OrderId)
		}
		if query.WarehouseId > 0 {
			conditions = append(conditions, "warehouse_id = ?")
			args = append(args, query.WarehouseId)
		}
		if query.ProductId > 0 {
			conditions = append(conditions, "product_id = ?")
			args = append(args, query.ProductId)
		}
		if query.Sku != "" {
			conditions = append(conditions, "sku like ?")
			args = append(args, "%"+query.Sku+"%")
		}
		if query.LocationId > 0 {
			conditions = append(conditions, "location_id = ?")
			args = append(args, query.LocationId)
		}
		if query.Status != nil {
			conditions = append(conditions, "status = ?")
			args = append(args, *query.Status)
		}
		if query.Operator != "" {
			conditions = append(conditions, "operator like ?")
			args = append(args, "%"+query.Operator+"%")
		}
	}

	if len(conditions) > 0 {
		return " where " + strings.Join(conditions, " and "), args
	}
	return "", nil
}

func (m *defaultPickingTaskModel) FindList(page, pageSize int, query *PickingTaskQuery) ([]*PickingTask, error) {
	var resp []*PickingTask
	offset := (page - 1) * pageSize

	condition, args := m.buildQueryCondition(query)
	baseQuery := fmt.Sprintf("select id, task_no, order_id, order_item_id, warehouse_id, product_id, sku, location_id, plan_qty, pick_qty, sort_order, status, operator, complete_time, remark, create_time, update_time from %s", m.table)
	sqlQuery := fmt.Sprintf("%s%s order by sort_order asc, id desc limit ?, ?", baseQuery, condition)
	args = append(args, offset, pageSize)

	err := m.conn.QueryRows(&resp, sqlQuery, args...)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (m *defaultPickingTaskModel) Count(query *PickingTaskQuery) (int64, error) {
	var count int64
	condition, args := m.buildQueryCondition(query)
	sqlQuery := fmt.Sprintf("select count(*) from %s%s", m.table, condition)

	err := m.conn.QueryRow(&count, sqlQuery, args...)
	return count, err
}

func (m *defaultPickingTaskModel) Update(data *PickingTask) error {
	query := fmt.Sprintf("update %s set task_no=?, order_id=?, order_item_id=?, warehouse_id=?, product_id=?, sku=?, location_id=?, plan_qty=?, pick_qty=?, sort_order=?, status=?, operator=?, complete_time=?, remark=?, update_time=now() where id=?", m.table)
	_, err := m.conn.Exec(query, data.TaskNo, data.OrderId, data.OrderItemId, data.WarehouseId, data.ProductId, data.Sku, data.LocationId, data.PlanQty, data.PickQty, data.SortOrder, data.Status, data.Operator, data.CompleteTime, data.Remark, data.Id)
	return err
}

func (m *defaultPickingTaskModel) Delete(id int64) error {
	query := fmt.Sprintf("delete from %s where id = ?", m.table)
	_, err := m.conn.Exec(query, id)
	return err
}
