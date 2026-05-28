package model

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type (
	SysUser struct {
		Id         int64     `db:"id"`
		Username   string    `db:"username"`
		Password   string    `db:"password"`
		RealName   string    `db:"real_name"`
		Phone      string    `db:"phone"`
		Email      *string   `db:"email"`
		Role       string    `db:"role"`
		Status     int64     `db:"status"`
		Remark     *string   `db:"remark"`
		CreateTime time.Time `db:"create_time"`
		UpdateTime time.Time `db:"update_time"`
	}

	SysUserQuery struct {
		Username string
		RealName string
		Phone    string
		Role     string
		Status   *int64
	}

	SysUserModel interface {
		Insert(data *SysUser) (sql.Result, error)
		FindOne(id int64) (*SysUser, error)
		FindList(page, pageSize int, query *SysUserQuery) ([]*SysUser, error)
		Count(query *SysUserQuery) (int64, error)
		Update(data *SysUser) error
		Delete(id int64) error
	}

	defaultSysUserModel struct {
		conn  sqlx.SqlConn
		table string
	}
)

func NewSysUserModel(conn sqlx.SqlConn) SysUserModel {
	return &defaultSysUserModel{conn: conn, table: "sys_user"}
}

func (m *defaultSysUserModel) Insert(data *SysUser) (sql.Result, error) {
	query := fmt.Sprintf("insert into %s (username, password, real_name, phone, email, role, status, remark, create_time, update_time) values (?, ?, ?, ?, ?, ?, ?, ?, now(), now())", m.table)
	return m.conn.Exec(query, data.Username, data.Password, data.RealName, data.Phone, data.Email, data.Role, data.Status, data.Remark)
}

func (m *defaultSysUserModel) FindOne(id int64) (*SysUser, error) {
	var resp SysUser
	query := fmt.Sprintf("select id, username, password, real_name, phone, email, role, status, remark, create_time, update_time from %s where id = ? limit 1", m.table)
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

func (m *defaultSysUserModel) buildQueryCondition(query *SysUserQuery) (string, []interface{}) {
	var conditions []string
	var args []interface{}

	if query != nil {
		if query.Username != "" {
			conditions = append(conditions, "username like ?")
			args = append(args, "%"+query.Username+"%")
		}
		if query.RealName != "" {
			conditions = append(conditions, "real_name like ?")
			args = append(args, "%"+query.RealName+"%")
		}
		if query.Phone != "" {
			conditions = append(conditions, "phone like ?")
			args = append(args, "%"+query.Phone+"%")
		}
		if query.Role != "" {
			conditions = append(conditions, "role = ?")
			args = append(args, query.Role)
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

func (m *defaultSysUserModel) FindList(page, pageSize int, query *SysUserQuery) ([]*SysUser, error) {
	var resp []*SysUser
	offset := (page - 1) * pageSize

	condition, args := m.buildQueryCondition(query)
	baseQuery := fmt.Sprintf("select id, username, password, real_name, phone, email, role, status, remark, create_time, update_time from %s", m.table)
	sqlQuery := fmt.Sprintf("%s%s order by id desc limit ?, ?", baseQuery, condition)
	args = append(args, offset, pageSize)

	err := m.conn.QueryRows(&resp, sqlQuery, args...)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (m *defaultSysUserModel) Count(query *SysUserQuery) (int64, error) {
	var count int64
	condition, args := m.buildQueryCondition(query)
	sqlQuery := fmt.Sprintf("select count(*) from %s%s", m.table, condition)

	err := m.conn.QueryRow(&count, sqlQuery, args...)
	return count, err
}

func (m *defaultSysUserModel) Update(data *SysUser) error {
	query := fmt.Sprintf("update %s set username=?, password=?, real_name=?, phone=?, email=?, role=?, status=?, remark=?, update_time=now() where id=?", m.table)
	_, err := m.conn.Exec(query, data.Username, data.Password, data.RealName, data.Phone, data.Email, data.Role, data.Status, data.Remark, data.Id)
	return err
}

func (m *defaultSysUserModel) Delete(id int64) error {
	query := fmt.Sprintf("delete from %s where id = ?", m.table)
	_, err := m.conn.Exec(query, id)
	return err
}
