package models

import (
	"database/sql"
	"time"
)

const OrderTableName = "orders"
const OrderStatusLogTableName = "order_status_logs"
const OrderBidTableName = "order_bids"

const (
	OrderStatusPending    = 0
	OrderStatusAccepted   = 1
	OrderStatusInService  = 2
	OrderStatusToReview   = 3
	OrderStatusCompleted  = 4
	OrderStatusCancelled  = 5
)

const (
	PaymentStatusPending = 0
	PaymentStatusPaid    = 1
	PaymentStatusRefund  = 2
)

const (
	BidStatusPending  = 0
	BidStatusAccepted = 1
	BidStatusRejected = 2
)

type Order struct {
	ID              uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	OrderNo         string    `json:"order_no" gorm:"type:varchar(32);not null;unique"`
	UserID          uint64    `json:"user_id" gorm:"type:bigint;not null;index"`
	WorkerID        uint64    `json:"worker_id" gorm:"type:bigint;index"`
	ServiceID       uint64    `json:"service_id" gorm:"type:bigint;not null;index"`
	AddressID       uint64    `json:"address_id" gorm:"type:bigint;not null"`
	TimeSlotID      uint64    `json:"time_slot_id" gorm:"type:bigint"`
	Title           string    `json:"title" gorm:"type:varchar(200);not null"`
	Description     string    `json:"description" gorm:"type:text"`
	Images          string    `json:"images" gorm:"type:varchar(1000)"`
	BasePrice       float64   `json:"base_price" gorm:"type:decimal(10,2);not null;default:0"`
	TotalPrice      float64   `json:"total_price" gorm:"type:decimal(10,2);not null;default:0"`
	PaymentStatus   int       `json:"payment_status" gorm:"type:tinyint;not null;default:0"`
	Status          int       `json:"status" gorm:"type:tinyint;not null;default:0"`
	CancelReason    string    `json:"cancel_reason" gorm:"type:varchar(255)"`
	AppointmentTime time.Time `json:"appointment_time" gorm:"type:datetime"`
	ServiceStartTime time.Time `json:"service_start_time" gorm:"type:datetime"`
	ServiceEndTime  time.Time `json:"service_end_time" gorm:"type:datetime"`
	CompletedTime   time.Time `json:"completed_time" gorm:"type:datetime"`
	CreatedAt       time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt       time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type OrderStatusLog struct {
	ID        uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	OrderID   uint64    `json:"order_id" gorm:"type:bigint;not null;index"`
	UserID    uint64    `json:"user_id" gorm:"type:bigint;not null"`
	OldStatus int       `json:"old_status" gorm:"type:tinyint;not null"`
	NewStatus int       `json:"new_status" gorm:"type:tinyint;not null"`
	Remark    string    `json:"remark" gorm:"type:varchar(255)"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}

type OrderBid struct {
	ID         uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	OrderID    uint64    `json:"order_id" gorm:"type:bigint;not null;index"`
	WorkerID   uint64    `json:"worker_id" gorm:"type:bigint;not null;index"`
	Price      float64   `json:"price" gorm:"type:decimal(10,2);not null"`
	Remark     string    `json:"remark" gorm:"type:varchar(500)"`
	EstimatedTime int    `json:"estimated_time" gorm:"type:int"`
	Status     int       `json:"status" gorm:"type:tinyint;not null;default:0"`
	CreatedAt  time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type OrderModel struct {
	db *sql.DB
}

type OrderStatusLogModel struct {
	db *sql.DB
}

type OrderBidModel struct {
	db *sql.DB
}

func NewOrderModel(db *sql.DB) *OrderModel {
	return &OrderModel{db: db}
}

func NewOrderStatusLogModel(db *sql.DB) *OrderStatusLogModel {
	return &OrderStatusLogModel{db: db}
}

func NewOrderBidModel(db *sql.DB) *OrderBidModel {
	return &OrderBidModel{db: db}
}

func (m *OrderModel) Create(order *Order) error {
	query := `INSERT INTO ` + OrderTableName + ` (order_no, user_id, worker_id, service_id, address_id, time_slot_id, title, description, images, base_price, total_price, payment_status, status, cancel_reason, appointment_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	result, err := m.db.Exec(query, order.OrderNo, order.UserID, order.WorkerID, order.ServiceID, order.AddressID, order.TimeSlotID, order.Title, order.Description, order.Images, order.BasePrice, order.TotalPrice, order.PaymentStatus, order.Status, order.CancelReason, order.AppointmentTime)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	order.ID = uint64(id)
	return nil
}

func (m *OrderModel) GetByID(id uint64) (*Order, error) {
	query := `SELECT id, order_no, user_id, worker_id, service_id, address_id, time_slot_id, title, description, images, base_price, total_price, payment_status, status, cancel_reason, appointment_time, service_start_time, service_end_time, completed_time, created_at, updated_at FROM ` + OrderTableName + ` WHERE id = ?`
	row := m.db.QueryRow(query, id)
	order := &Order{}
	err := row.Scan(&order.ID, &order.OrderNo, &order.UserID, &order.WorkerID, &order.ServiceID, &order.AddressID, &order.TimeSlotID, &order.Title, &order.Description, &order.Images, &order.BasePrice, &order.TotalPrice, &order.PaymentStatus, &order.Status, &order.CancelReason, &order.AppointmentTime, &order.ServiceStartTime, &order.ServiceEndTime, &order.CompletedTime, &order.CreatedAt, &order.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return order, nil
}

func (m *OrderModel) GetByOrderNo(orderNo string) (*Order, error) {
	query := `SELECT id, order_no, user_id, worker_id, service_id, address_id, time_slot_id, title, description, images, base_price, total_price, payment_status, status, cancel_reason, appointment_time, service_start_time, service_end_time, completed_time, created_at, updated_at FROM ` + OrderTableName + ` WHERE order_no = ?`
	row := m.db.QueryRow(query, orderNo)
	order := &Order{}
	err := row.Scan(&order.ID, &order.OrderNo, &order.UserID, &order.WorkerID, &order.ServiceID, &order.AddressID, &order.TimeSlotID, &order.Title, &order.Description, &order.Images, &order.BasePrice, &order.TotalPrice, &order.PaymentStatus, &order.Status, &order.CancelReason, &order.AppointmentTime, &order.ServiceStartTime, &order.ServiceEndTime, &order.CompletedTime, &order.CreatedAt, &order.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return order, nil
}

func (m *OrderModel) Update(order *Order) error {
	query := `UPDATE ` + OrderTableName + ` SET order_no = ?, user_id = ?, worker_id = ?, service_id = ?, address_id = ?, time_slot_id = ?, title = ?, description = ?, images = ?, base_price = ?, total_price = ?, payment_status = ?, status = ?, cancel_reason = ?, appointment_time = ?, service_start_time = ?, service_end_time = ?, completed_time = ? WHERE id = ?`
	_, err := m.db.Exec(query, order.OrderNo, order.UserID, order.WorkerID, order.ServiceID, order.AddressID, order.TimeSlotID, order.Title, order.Description, order.Images, order.BasePrice, order.TotalPrice, order.PaymentStatus, order.Status, order.CancelReason, order.AppointmentTime, order.ServiceStartTime, order.ServiceEndTime, order.CompletedTime, order.ID)
	return err
}

func (m *OrderModel) UpdateStatus(id uint64, status int) error {
	query := `UPDATE ` + OrderTableName + ` SET status = ? WHERE id = ?`
	_, err := m.db.Exec(query, status, id)
	return err
}

func (m *OrderModel) Delete(id uint64) error {
	query := `DELETE FROM ` + OrderTableName + ` WHERE id = ?`
	_, err := m.db.Exec(query, id)
	return err
}

func (m *OrderModel) ListByUserID(userID uint64, status int, page, pageSize int) ([]*Order, int64, error) {
	var total int64
	countQuery := `SELECT COUNT(*) FROM ` + OrderTableName + ` WHERE user_id = ?`
	args := []interface{}{userID}
	if status >= 0 {
		countQuery += ` AND status = ?`
		args = append(args, status)
	}
	err := m.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	query := `SELECT id, order_no, user_id, worker_id, service_id, address_id, time_slot_id, title, description, images, base_price, total_price, payment_status, status, cancel_reason, appointment_time, service_start_time, service_end_time, completed_time, created_at, updated_at FROM ` + OrderTableName + ` WHERE user_id = ?`
	if status >= 0 {
		query += ` AND status = ?`
	}
	query += ` ORDER BY id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)
	rows, err := m.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	orders := make([]*Order, 0)
	for rows.Next() {
		order := &Order{}
		err := rows.Scan(&order.ID, &order.OrderNo, &order.UserID, &order.WorkerID, &order.ServiceID, &order.AddressID, &order.TimeSlotID, &order.Title, &order.Description, &order.Images, &order.BasePrice, &order.TotalPrice, &order.PaymentStatus, &order.Status, &order.CancelReason, &order.AppointmentTime, &order.ServiceStartTime, &order.ServiceEndTime, &order.CompletedTime, &order.CreatedAt, &order.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		orders = append(orders, order)
	}
	return orders, total, nil
}

func (m *OrderModel) ListByWorkerID(workerID uint64, status int, page, pageSize int) ([]*Order, int64, error) {
	var total int64
	countQuery := `SELECT COUNT(*) FROM ` + OrderTableName + ` WHERE worker_id = ?`
	args := []interface{}{workerID}
	if status >= 0 {
		countQuery += ` AND status = ?`
		args = append(args, status)
	}
	err := m.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	query := `SELECT id, order_no, user_id, worker_id, service_id, address_id, time_slot_id, title, description, images, base_price, total_price, payment_status, status, cancel_reason, appointment_time, service_start_time, service_end_time, completed_time, created_at, updated_at FROM ` + OrderTableName + ` WHERE worker_id = ?`
	if status >= 0 {
		query += ` AND status = ?`
	}
	query += ` ORDER BY id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)
	rows, err := m.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	orders := make([]*Order, 0)
	for rows.Next() {
		order := &Order{}
		err := rows.Scan(&order.ID, &order.OrderNo, &order.UserID, &order.WorkerID, &order.ServiceID, &order.AddressID, &order.TimeSlotID, &order.Title, &order.Description, &order.Images, &order.BasePrice, &order.TotalPrice, &order.PaymentStatus, &order.Status, &order.CancelReason, &order.AppointmentTime, &order.ServiceStartTime, &order.ServiceEndTime, &order.CompletedTime, &order.CreatedAt, &order.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		orders = append(orders, order)
	}
	return orders, total, nil
}

func (m *OrderStatusLogModel) Create(log *OrderStatusLog) error {
	query := `INSERT INTO ` + OrderStatusLogTableName + ` (order_id, user_id, old_status, new_status, remark) VALUES (?, ?, ?, ?, ?)`
	result, err := m.db.Exec(query, log.OrderID, log.UserID, log.OldStatus, log.NewStatus, log.Remark)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	log.ID = uint64(id)
	return nil
}

func (m *OrderStatusLogModel) ListByOrderID(orderID uint64) ([]*OrderStatusLog, error) {
	query := `SELECT id, order_id, user_id, old_status, new_status, remark, created_at FROM ` + OrderStatusLogTableName + ` WHERE order_id = ? ORDER BY id DESC`
	rows, err := m.db.Query(query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	logs := make([]*OrderStatusLog, 0)
	for rows.Next() {
		log := &OrderStatusLog{}
		err := rows.Scan(&log.ID, &log.OrderID, &log.UserID, &log.OldStatus, &log.NewStatus, &log.Remark, &log.CreatedAt)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, nil
}

func (m *OrderBidModel) Create(bid *OrderBid) error {
	query := `INSERT INTO ` + OrderBidTableName + ` (order_id, worker_id, price, remark, estimated_time, status) VALUES (?, ?, ?, ?, ?, ?)`
	result, err := m.db.Exec(query, bid.OrderID, bid.WorkerID, bid.Price, bid.Remark, bid.EstimatedTime, bid.Status)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	bid.ID = uint64(id)
	return nil
}

func (m *OrderBidModel) GetByID(id uint64) (*OrderBid, error) {
	query := `SELECT id, order_id, worker_id, price, remark, estimated_time, status, created_at, updated_at FROM ` + OrderBidTableName + ` WHERE id = ?`
	row := m.db.QueryRow(query, id)
	bid := &OrderBid{}
	err := row.Scan(&bid.ID, &bid.OrderID, &bid.WorkerID, &bid.Price, &bid.Remark, &bid.EstimatedTime, &bid.Status, &bid.CreatedAt, &bid.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return bid, nil
}

func (m *OrderBidModel) Update(bid *OrderBid) error {
	query := `UPDATE ` + OrderBidTableName + ` SET price = ?, remark = ?, estimated_time = ?, status = ? WHERE id = ?`
	_, err := m.db.Exec(query, bid.Price, bid.Remark, bid.EstimatedTime, bid.Status, bid.ID)
	return err
}

func (m *OrderBidModel) ListByOrderID(orderID uint64) ([]*OrderBid, error) {
	query := `SELECT id, order_id, worker_id, price, remark, estimated_time, status, created_at, updated_at FROM ` + OrderBidTableName + ` WHERE order_id = ? ORDER BY id DESC`
	rows, err := m.db.Query(query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bids := make([]*OrderBid, 0)
	for rows.Next() {
		bid := &OrderBid{}
		err := rows.Scan(&bid.ID, &bid.OrderID, &bid.WorkerID, &bid.Price, &bid.Remark, &bid.EstimatedTime, &bid.Status, &bid.CreatedAt, &bid.UpdatedAt)
		if err != nil {
			return nil, err
		}
		bids = append(bids, bid)
	}
	return bids, nil
}

func (m *OrderBidModel) ListByWorkerID(workerID uint64, status int, page, pageSize int) ([]*OrderBid, int64, error) {
	var total int64
	countQuery := `SELECT COUNT(*) FROM ` + OrderBidTableName + ` WHERE worker_id = ?`
	args := []interface{}{workerID}
	if status >= 0 {
		countQuery += ` AND status = ?`
		args = append(args, status)
	}
	err := m.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	query := `SELECT id, order_id, worker_id, price, remark, estimated_time, status, created_at, updated_at FROM ` + OrderBidTableName + ` WHERE worker_id = ?`
	if status >= 0 {
		query += ` AND status = ?`
	}
	query += ` ORDER BY id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)
	rows, err := m.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	bids := make([]*OrderBid, 0)
	for rows.Next() {
		bid := &OrderBid{}
		err := rows.Scan(&bid.ID, &bid.OrderID, &bid.WorkerID, &bid.Price, &bid.Remark, &bid.EstimatedTime, &bid.Status, &bid.CreatedAt, &bid.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		bids = append(bids, bid)
	}
	return bids, total, nil
}
