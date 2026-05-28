package model

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type (
	Shelf struct {
		Id          int64     `db:"id"`
		WarehouseId int64     `db:"warehouse_id"`
		ShelfCode   string    `db:"shelf_code"`
		ShelfName   string    `db:"shelf_name"`
		Rows        int       `db:"rows"`
		Columns     int       `db:"columns"`
		Status      int64     `db:"status"`
		Remark      string    `db:"remark"`
		CreateTime  time.Time `db:"create_time"`
		UpdateTime  time.Time `db:"update_time"`
	}

	ShelfQuery struct {
		WarehouseId *int64
		ShelfCode   string
		ShelfName   string
		Status      *int64
	}

	ShelfModel interface {
		Insert(data *Shelf) (sql.Result, error)
		FindOne(id int64) (*Shelf, error)
		FindList(page, pageSize int, query *ShelfQuery) ([]*Shelf, error)
		Count(query *ShelfQuery) (int64, error)
		Update(data *Shelf) error
		Delete(id int64) error
	}

	defaultShelfModel struct {
		conn  sqlx.SqlConn
		table string
	}
)

func NewShelfModel(conn sqlx.SqlConn) ShelfModel {
	return &defaultShelfModel{conn: conn, table: "shelf"}
}

func (m *defaultShelfModel) Insert(data *Shelf) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (warehouse_id, shelf_code, shelf_name, rows, columns, status, remark, create_time, update_time) values (?, ?, ?, ?, ?, ?, ?, now(), now())", m.table)
	return m.conn.Exec(query, data.WarehouseId, data.ShelfCode, data.ShelfName, data.Rows, data.Columns, data.Status, data.Remark)
}

func (m *defaultShelfModel) FindOne(id int64) (*Shelf, error) {
	var resp Shelf
	query := fmt.Sprintf("select id, warehouse_id, shelf_code, shelf_name, rows, columns, status, remark, create_time, update_time from %s where id = ? limit 1", m.table)
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

func (m *defaultShelfModel) buildQueryCondition(query *ShelfQuery) (string, []interface{}) {
	var conditions []string
	var args []interface{}

	if query != nil {
		if query.WarehouseId != nil {
			conditions = append(conditions, "warehouse_id = ?")
			args = append(args, *query.WarehouseId)
		}
		if query.ShelfCode != "" {
			conditions = append(conditions, "shelf_code like ?")
			args = append(args, "%"+query.ShelfCode+"%")
		}
		if query.ShelfName != "" {
			conditions = append(conditions, "shelf_name like ?")
			args = append(args, "%"+query.ShelfName+"%")
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

func (m *defaultShelfModel) FindList(page, pageSize int, query *ShelfQuery) ([]*Shelf, error) {
	var resp []*Shelf
	offset := (page - 1) * pageSize

	condition, args := m.buildQueryCondition(query)
	baseQuery := fmt.Sprintf("select id, warehouse_id, shelf_code, shelf_name, rows, columns, status, remark, create_time, update_time from %s", m.table)
	sqlQuery := fmt.Sprintf("%s%s order by id desc limit ?, ?", baseQuery, condition)
	args = append(args, offset, pageSize)

	err := m.conn.QueryRows(&resp, sqlQuery, args...)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (m *defaultShelfModel) Count(query *ShelfQuery) (int64, error) {
	var count int64
	condition, args := m.buildQueryCondition(query)
	sqlQuery := fmt.Sprintf("select count(*) from %s%s", m.table, condition)

	err := m.conn.QueryRow(&count, sqlQuery, args...)
	return count, err
}

func (m *defaultShelfModel) Update(data *Shelf) error {
	query := fmt.Sprintf("update %s set warehouse_id=?, shelf_code=?, shelf_name=?, rows=?, columns=?, status=?, remark=?, update_time=now() where id=?", m.table)
	_, err := m.conn.Exec(query, data.WarehouseId, data.ShelfCode, data.ShelfName, data.Rows, data.Columns, data.Status, data.Remark, data.Id)
	return err
}

func (m *defaultShelfModel) Delete(id int64) error {
	query := fmt.Sprintf("delete from %s where id = ?", m.table)
	_, err := m.conn.Exec(query, id)
	return err
}
