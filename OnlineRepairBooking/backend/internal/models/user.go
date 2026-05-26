package models

import (
	"database/sql"
	"time"
)

const UserTableName = "users"

const (
	RoleUser   = 1
	RoleWorker = 2
	RoleAdmin  = 3
)

const (
	UserStatusActive   = 1
	UserStatusInactive = 0
)

type User struct {
	ID        uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	Username  string    `json:"username" gorm:"type:varchar(50);not null;unique"`
	Phone     string    `json:"phone" gorm:"type:varchar(20);not null;unique"`
	Password  string    `json:"-" gorm:"type:varchar(255);not null"`
	Avatar    string    `json:"avatar" gorm:"type:varchar(255)"`
	Role      int       `json:"role" gorm:"type:tinyint;not null;default:1"`
	Status    int       `json:"status" gorm:"type:tinyint;not null;default:1"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type UserModel struct {
	db *sql.DB
}

func NewUserModel(db *sql.DB) *UserModel {
	return &UserModel{db: db}
}

func (m *UserModel) Create(user *User) error {
	query := `INSERT INTO ` + UserTableName + ` (username, phone, password, avatar, role, status) VALUES (?, ?, ?, ?, ?, ?)`
	result, err := m.db.Exec(query, user.Username, user.Phone, user.Password, user.Avatar, user.Role, user.Status)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	user.ID = uint64(id)
	return nil
}

func (m *UserModel) GetByID(id uint64) (*User, error) {
	query := `SELECT id, username, phone, password, avatar, role, status, created_at, updated_at FROM ` + UserTableName + ` WHERE id = ?`
	row := m.db.QueryRow(query, id)
	user := &User{}
	err := row.Scan(&user.ID, &user.Username, &user.Phone, &user.Password, &user.Avatar, &user.Role, &user.Status, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (m *UserModel) GetByPhone(phone string) (*User, error) {
	query := `SELECT id, username, phone, password, avatar, role, status, created_at, updated_at FROM ` + UserTableName + ` WHERE phone = ?`
	row := m.db.QueryRow(query, phone)
	user := &User{}
	err := row.Scan(&user.ID, &user.Username, &user.Phone, &user.Password, &user.Avatar, &user.Role, &user.Status, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (m *UserModel) Update(user *User) error {
	query := `UPDATE ` + UserTableName + ` SET username = ?, phone = ?, password = ?, avatar = ?, role = ?, status = ? WHERE id = ?`
	_, err := m.db.Exec(query, user.Username, user.Phone, user.Password, user.Avatar, user.Role, user.Status, user.ID)
	return err
}

func (m *UserModel) Delete(id uint64) error {
	query := `DELETE FROM ` + UserTableName + ` WHERE id = ?`
	_, err := m.db.Exec(query, id)
	return err
}

func (m *UserModel) List(page, pageSize int) ([]*User, int64, error) {
	var total int64
	countQuery := `SELECT COUNT(*) FROM ` + UserTableName
	err := m.db.QueryRow(countQuery).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	query := `SELECT id, username, phone, password, avatar, role, status, created_at, updated_at FROM ` + UserTableName + ` ORDER BY id DESC LIMIT ? OFFSET ?`
	rows, err := m.db.Query(query, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	users := make([]*User, 0)
	for rows.Next() {
		user := &User{}
		err := rows.Scan(&user.ID, &user.Username, &user.Phone, &user.Password, &user.Avatar, &user.Role, &user.Status, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		users = append(users, user)
	}
	return users, total, nil
}
