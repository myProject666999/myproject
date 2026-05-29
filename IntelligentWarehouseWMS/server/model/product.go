package model

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type (
	Product struct {
		Id          int64      `db:"id"`
		Sku         string     `db:"sku"`
		ProductName string     `db:"product_name"`
		Category    *string    `db:"category"`
		Spec        *string    `db:"spec"`
		Unit        string     `db:"unit"`
		Weight      *float64   `db:"weight"`
		Volume      *float64   `db:"volume"`
		MinStock    int        `db:"min_stock"`
		MaxStock    int        `db:"max_stock"`
		Status      int64      `db:"status"`
		Remark      *string    `db:"remark"`
		CreateTime  time.Time  `db:"create_time"`
		UpdateTime  time.Time  `db:"update_time"`
	}

	ProductQuery struct {
		Sku         string
		ProductName string
		Category    string
		Status      *int64
	}

	ProductModel interface {
		Insert(data *Product) (sql.Result, error)
		FindOne(id int64) (*Product, error)
		FindList(page, pageSize int, query *ProductQuery) ([]*Product, error)
		Count(query *ProductQuery) (int64, error)
		Update(data *Product) error
		Delete(id int64) error
	}

	defaultProductModel struct {
		conn  sqlx.SqlConn
		table string
	}
)

func NewProductModel(conn sqlx.SqlConn) ProductModel {
	return &defaultProductModel{conn: conn, table: "product"}
}

func (m *defaultProductModel) Insert(data *Product) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (sku, product_name, category, spec, unit, weight, volume, min_stock, max_stock, status, remark, create_time, update_time) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())", m.table)
	return m.conn.Exec(query, data.Sku, data.ProductName, data.Category, data.Spec, data.Unit, data.Weight, data.Volume, data.MinStock, data.MaxStock, data.Status, data.Remark)
}

func (m *defaultProductModel) FindOne(id int64) (*Product, error) {
	var resp Product
	query := fmt.Sprintf("select id, sku, product_name, category, spec, unit, weight, volume, min_stock, max_stock, status, remark, create_time, update_time from %s where id = ? limit 1", m.table)
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

func (m *defaultProductModel) buildQueryCondition(query *ProductQuery) (string, []interface{}) {
	var conditions []string
	var args []interface{}

	if query != nil {
		if query.Sku != "" {
			conditions = append(conditions, "sku like ?")
			args = append(args, "%"+query.Sku+"%")
		}
		if query.ProductName != "" {
			conditions = append(conditions, "product_name like ?")
			args = append(args, "%"+query.ProductName+"%")
		}
		if query.Category != "" {
			conditions = append(conditions, "category = ?")
			args = append(args, query.Category)
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

func (m *defaultProductModel) FindList(page, pageSize int, query *ProductQuery) ([]*Product, error) {
	var resp []*Product
	offset := (page - 1) * pageSize

	condition, args := m.buildQueryCondition(query)
	baseQuery := fmt.Sprintf("select id, sku, product_name, category, spec, unit, weight, volume, min_stock, max_stock, status, remark, create_time, update_time from %s", m.table)
	sqlQuery := fmt.Sprintf("%s%s order by id desc limit ?, ?", baseQuery, condition)
	args = append(args, offset, pageSize)

	err := m.conn.QueryRows(&resp, sqlQuery, args...)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (m *defaultProductModel) Count(query *ProductQuery) (int64, error) {
	var count int64
	condition, args := m.buildQueryCondition(query)
	sqlQuery := fmt.Sprintf("select count(*) from %s%s", m.table, condition)

	err := m.conn.QueryRow(&count, sqlQuery, args...)
	return count, err
}

func (m *defaultProductModel) Update(data *Product) error {
	query := fmt.Sprintf("update %s set sku=?, product_name=?, category=?, spec=?, unit=?, weight=?, volume=?, min_stock=?, max_stock=?, status=?, remark=?, update_time=now() where id=?", m.table)
	_, err := m.conn.Exec(query, data.Sku, data.ProductName, data.Category, data.Spec, data.Unit, data.Weight, data.Volume, data.MinStock, data.MaxStock, data.Status, data.Remark, data.Id)
	return err
}

func (m *defaultProductModel) Delete(id int64) error {
	query := fmt.Sprintf("delete from %s where id = ?", m.table)
	_, err := m.conn.Exec(query, id)
	return err
}
