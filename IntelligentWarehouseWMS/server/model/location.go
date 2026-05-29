package model

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type (
	Location struct {
		Id           int64     `db:"id"`
		WarehouseId  int64     `db:"warehouse_id"`
		ShelfId      int64     `db:"shelf_id"`
		LocationCode string    `db:"location_code"`
		RowNo        int       `db:"row_no"`
		ColNo        int       `db:"col_no"`
		Capacity     float64   `db:"capacity"`
		UsedCapacity float64   `db:"used_capacity"`
		Status       int64     `db:"status"`
		Remark       *string   `db:"remark"`
		CreateTime   time.Time `db:"create_time"`
		UpdateTime   time.Time `db:"update_time"`
	}

	LocationQuery struct {
		WarehouseId  *int64
		ShelfId      *int64
		LocationCode string
		Status       *int64
	}

	LocationModel interface {
		Insert(data *Location) (sql.Result, error)
		FindOne(id int64) (*Location, error)
		FindList(page, pageSize int, query *LocationQuery) ([]*Location, error)
		Count(query *LocationQuery) (int64, error)
		Update(data *Location) error
		Delete(id int64) error
	}

	defaultLocationModel struct {
		conn  sqlx.SqlConn
		table string
	}
)

func NewLocationModel(conn sqlx.SqlConn) LocationModel {
	return &defaultLocationModel{conn: conn, table: "location"}
}

func (m *defaultLocationModel) Insert(data *Location) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (warehouse_id, shelf_id, location_code, row_no, col_no, capacity, used_capacity, status, remark, create_time, update_time) values (?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())", m.table)
	return m.conn.Exec(query, data.WarehouseId, data.ShelfId, data.LocationCode, data.RowNo, data.ColNo, data.Capacity, data.UsedCapacity, data.Status, data.Remark)
}

func (m *defaultLocationModel) FindOne(id int64) (*Location, error) {
	var resp Location
	query := fmt.Sprintf("select id, warehouse_id, shelf_id, location_code, row_no, col_no, capacity, used_capacity, status, remark, create_time, update_time from %s where id = ? limit 1", m.table)
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

func (m *defaultLocationModel) buildQueryCondition(query *LocationQuery) (string, []interface{}) {
	var conditions []string
	var args []interface{}

	if query != nil {
		if query.WarehouseId != nil {
			conditions = append(conditions, "warehouse_id = ?")
			args = append(args, *query.WarehouseId)
		}
		if query.ShelfId != nil {
			conditions = append(conditions, "shelf_id = ?")
			args = append(args, *query.ShelfId)
		}
		if query.LocationCode != "" {
			conditions = append(conditions, "location_code like ?")
			args = append(args, "%"+query.LocationCode+"%")
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

func (m *defaultLocationModel) FindList(page, pageSize int, query *LocationQuery) ([]*Location, error) {
	var resp []*Location
	offset := (page - 1) * pageSize

	condition, args := m.buildQueryCondition(query)
	baseQuery := fmt.Sprintf("select id, warehouse_id, shelf_id, location_code, row_no, col_no, capacity, used_capacity, status, remark, create_time, update_time from %s", m.table)
	sqlQuery := fmt.Sprintf("%s%s order by id desc limit ?, ?", baseQuery, condition)
	args = append(args, offset, pageSize)

	err := m.conn.QueryRows(&resp, sqlQuery, args...)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (m *defaultLocationModel) Count(query *LocationQuery) (int64, error) {
	var count int64
	condition, args := m.buildQueryCondition(query)
	sqlQuery := fmt.Sprintf("select count(*) from %s%s", m.table, condition)

	err := m.conn.QueryRow(&count, sqlQuery, args...)
	return count, err
}

func (m *defaultLocationModel) Update(data *Location) error {
	query := fmt.Sprintf("update %s set warehouse_id=?, shelf_id=?, location_code=?, row_no=?, col_no=?, capacity=?, used_capacity=?, status=?, remark=?, update_time=now() where id=?", m.table)
	_, err := m.conn.Exec(query, data.WarehouseId, data.ShelfId, data.LocationCode, data.RowNo, data.ColNo, data.Capacity, data.UsedCapacity, data.Status, data.Remark, data.Id)
	return err
}

func (m *defaultLocationModel) Delete(id int64) error {
	query := fmt.Sprintf("delete from %s where id = ?", m.table)
	_, err := m.conn.Exec(query, id)
	return err
}
