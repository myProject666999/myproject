package model

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type (
	InventoryAlert struct {
		Id           int64      `db:"id"`
		AlertNo      string     `db:"alert_no"`
		WarehouseId  int64      `db:"warehouse_id"`
		ProductId    int64      `db:"product_id"`
		Sku          string     `db:"sku"`
		ProductName  string     `db:"product_name"`
		AlertType    int64      `db:"alert_type"`
		CurrentQty   int64      `db:"current_qty"`
		ThresholdQty int64      `db:"threshold_qty"`
		Status       int64      `db:"status"`
		Handler      string     `db:"handler"`
		HandleTime   *time.Time `db:"handle_time"`
		Remark       string     `db:"remark"`
		CreateTime   time.Time  `db:"create_time"`
	}

	InventoryAlertQuery struct {
		AlertNo     string
		WarehouseId int64
		ProductId   int64
		Sku         string
		ProductName string
		AlertType   *int64
		Status      *int64
		Handler     string
	}

	InventoryAlertModel interface {
		Insert(data *InventoryAlert) (sql.Result, error)
		FindOne(id int64) (*InventoryAlert, error)
		FindList(page, pageSize int, query *InventoryAlertQuery) ([]*InventoryAlert, error)
		Count(query *InventoryAlertQuery) (int64, error)
		Update(data *InventoryAlert) error
		Delete(id int64) error
	}

	defaultInventoryAlertModel struct {
		conn  sqlx.SqlConn
		table string
	}
)

func NewInventoryAlertModel(conn sqlx.SqlConn) InventoryAlertModel {
	return &defaultInventoryAlertModel{conn: conn, table: "inventory_alert"}
}

func (m *defaultInventoryAlertModel) Insert(data *InventoryAlert) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (alert_no, warehouse_id, product_id, sku, product_name, alert_type, current_qty, threshold_qty, status, handler, handle_time, remark, create_time) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())", m.table)
	return m.conn.Exec(query, data.AlertNo, data.WarehouseId, data.ProductId, data.Sku, data.ProductName, data.AlertType, data.CurrentQty, data.ThresholdQty, data.Status, data.Handler, data.HandleTime, data.Remark)
}

func (m *defaultInventoryAlertModel) FindOne(id int64) (*InventoryAlert, error) {
	var resp InventoryAlert
	query := fmt.Sprintf("select id, alert_no, warehouse_id, product_id, sku, product_name, alert_type, current_qty, threshold_qty, status, handler, handle_time, remark, create_time from %s where id = ? limit 1", m.table)
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

func (m *defaultInventoryAlertModel) buildQueryCondition(query *InventoryAlertQuery) (string, []interface{}) {
	var conditions []string
	var args []interface{}

	if query != nil {
		if query.AlertNo != "" {
			conditions = append(conditions, "alert_no like ?")
			args = append(args, "%"+query.AlertNo+"%")
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
		if query.ProductName != "" {
			conditions = append(conditions, "product_name like ?")
			args = append(args, "%"+query.ProductName+"%")
		}
		if query.AlertType != nil {
			conditions = append(conditions, "alert_type = ?")
			args = append(args, *query.AlertType)
		}
		if query.Status != nil {
			conditions = append(conditions, "status = ?")
			args = append(args, *query.Status)
		}
		if query.Handler != "" {
			conditions = append(conditions, "handler like ?")
			args = append(args, "%"+query.Handler+"%")
		}
	}

	if len(conditions) > 0 {
		return " where " + strings.Join(conditions, " and "), args
	}
	return "", nil
}

func (m *defaultInventoryAlertModel) FindList(page, pageSize int, query *InventoryAlertQuery) ([]*InventoryAlert, error) {
	var resp []*InventoryAlert
	offset := (page - 1) * pageSize

	condition, args := m.buildQueryCondition(query)
	baseQuery := fmt.Sprintf("select id, alert_no, warehouse_id, product_id, sku, product_name, alert_type, current_qty, threshold_qty, status, handler, handle_time, remark, create_time from %s", m.table)
	sqlQuery := fmt.Sprintf("%s%s order by id desc limit ?, ?", baseQuery, condition)
	args = append(args, offset, pageSize)

	err := m.conn.QueryRows(&resp, sqlQuery, args...)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (m *defaultInventoryAlertModel) Count(query *InventoryAlertQuery) (int64, error) {
	var count int64
	condition, args := m.buildQueryCondition(query)
	sqlQuery := fmt.Sprintf("select count(*) from %s%s", m.table, condition)

	err := m.conn.QueryRow(&count, sqlQuery, args...)
	return count, err
}

func (m *defaultInventoryAlertModel) Update(data *InventoryAlert) error {
	query := fmt.Sprintf("update %s set alert_no=?, warehouse_id=?, product_id=?, sku=?, product_name=?, alert_type=?, current_qty=?, threshold_qty=?, status=?, handler=?, handle_time=?, remark=? where id=?", m.table)
	_, err := m.conn.Exec(query, data.AlertNo, data.WarehouseId, data.ProductId, data.Sku, data.ProductName, data.AlertType, data.CurrentQty, data.ThresholdQty, data.Status, data.Handler, data.HandleTime, data.Remark, data.Id)
	return err
}

func (m *defaultInventoryAlertModel) Delete(id int64) error {
	query := fmt.Sprintf("delete from %s where id = ?", m.table)
	_, err := m.conn.Exec(query, id)
	return err
}
