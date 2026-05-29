package model

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type (
	StocktakeTask struct {
		Id          int64      `db:"id"`
		TaskNo      string     `db:"task_no"`
		WarehouseId int64      `db:"warehouse_id"`
		TaskName    string     `db:"task_name"`
		TaskType    int64      `db:"task_type"`
		TotalSku    int64      `db:"total_sku"`
		CheckedSku  int64      `db:"checked_sku"`
		Status      int64      `db:"status"`
		Operator    string     `db:"operator"`
		StartTime   *time.Time `db:"start_time"`
		EndTime     *time.Time `db:"end_time"`
		Remark      *string     `db:"remark"`
		CreateTime  time.Time  `db:"create_time"`
		UpdateTime  time.Time  `db:"update_time"`
	}

	StocktakeTaskQuery struct {
		TaskNo      string
		TaskName    string
		WarehouseId int64
		TaskType    *int64
		Status      *int64
		Operator    string
	}

	StocktakeTaskModel interface {
		Insert(data *StocktakeTask) (sql.Result, error)
		FindOne(id int64) (*StocktakeTask, error)
		FindList(page, pageSize int, query *StocktakeTaskQuery) ([]*StocktakeTask, error)
		Count(query *StocktakeTaskQuery) (int64, error)
		Update(data *StocktakeTask) error
		Delete(id int64) error
	}

	defaultStocktakeTaskModel struct {
		conn  sqlx.SqlConn
		table string
	}
)

func NewStocktakeTaskModel(conn sqlx.SqlConn) StocktakeTaskModel {
	return &defaultStocktakeTaskModel{conn: conn, table: "stocktake_task"}
}

func (m *defaultStocktakeTaskModel) Insert(data *StocktakeTask) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (task_no, warehouse_id, task_name, task_type, total_sku, checked_sku, status, operator, start_time, end_time, remark, create_time, update_time) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())", m.table)
	return m.conn.Exec(query, data.TaskNo, data.WarehouseId, data.TaskName, data.TaskType, data.TotalSku, data.CheckedSku, data.Status, data.Operator, data.StartTime, data.EndTime, data.Remark)
}

func (m *defaultStocktakeTaskModel) FindOne(id int64) (*StocktakeTask, error) {
	var resp StocktakeTask
	query := fmt.Sprintf("select id, task_no, warehouse_id, task_name, task_type, total_sku, checked_sku, status, operator, start_time, end_time, remark, create_time, update_time from %s where id = ? limit 1", m.table)
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

func (m *defaultStocktakeTaskModel) buildQueryCondition(query *StocktakeTaskQuery) (string, []interface{}) {
	var conditions []string
	var args []interface{}

	if query != nil {
		if query.TaskNo != "" {
			conditions = append(conditions, "task_no like ?")
			args = append(args, "%"+query.TaskNo+"%")
		}
		if query.TaskName != "" {
			conditions = append(conditions, "task_name like ?")
			args = append(args, "%"+query.TaskName+"%")
		}
		if query.WarehouseId > 0 {
			conditions = append(conditions, "warehouse_id = ?")
			args = append(args, query.WarehouseId)
		}
		if query.TaskType != nil {
			conditions = append(conditions, "task_type = ?")
			args = append(args, *query.TaskType)
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

func (m *defaultStocktakeTaskModel) FindList(page, pageSize int, query *StocktakeTaskQuery) ([]*StocktakeTask, error) {
	var resp []*StocktakeTask
	offset := (page - 1) * pageSize

	condition, args := m.buildQueryCondition(query)
	baseQuery := fmt.Sprintf("select id, task_no, warehouse_id, task_name, task_type, total_sku, checked_sku, status, operator, start_time, end_time, remark, create_time, update_time from %s", m.table)
	sqlQuery := fmt.Sprintf("%s%s order by id desc limit ?, ?", baseQuery, condition)
	args = append(args, offset, pageSize)

	err := m.conn.QueryRows(&resp, sqlQuery, args...)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (m *defaultStocktakeTaskModel) Count(query *StocktakeTaskQuery) (int64, error) {
	var count int64
	condition, args := m.buildQueryCondition(query)
	sqlQuery := fmt.Sprintf("select count(*) from %s%s", m.table, condition)

	err := m.conn.QueryRow(&count, sqlQuery, args...)
	return count, err
}

func (m *defaultStocktakeTaskModel) Update(data *StocktakeTask) error {
	query := fmt.Sprintf("update %s set task_no=?, warehouse_id=?, task_name=?, task_type=?, total_sku=?, checked_sku=?, status=?, operator=?, start_time=?, end_time=?, remark=?, update_time=now() where id=?", m.table)
	_, err := m.conn.Exec(query, data.TaskNo, data.WarehouseId, data.TaskName, data.TaskType, data.TotalSku, data.CheckedSku, data.Status, data.Operator, data.StartTime, data.EndTime, data.Remark, data.Id)
	return err
}

func (m *defaultStocktakeTaskModel) Delete(id int64) error {
	query := fmt.Sprintf("delete from %s where id = ?", m.table)
	_, err := m.conn.Exec(query, id)
	return err
}
