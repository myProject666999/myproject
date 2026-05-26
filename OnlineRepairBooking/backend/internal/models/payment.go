package models

import (
	"database/sql"
	"time"
)

const PaymentTableName = "payments"

const (
	PaymentMethodWechat  = 1
	PaymentMethodAlipay  = 2
	PaymentMethodBankCard = 3
)

const (
	PayStatusPending = 0
	PayStatusSuccess = 1
	PayStatusFailed  = 2
	PayStatusRefund  = 3
)

type Payment struct {
	ID             uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	PaymentNo      string    `json:"payment_no" gorm:"type:varchar(64);not null;unique"`
	OrderID        uint64    `json:"order_id" gorm:"type:bigint;not null;index"`
	Amount         float64   `json:"amount" gorm:"type:decimal(10,2);not null"`
	PaymentMethod  int       `json:"payment_method" gorm:"type:tinyint;not null"`
	Status         int       `json:"status" gorm:"type:tinyint;not null;default:0"`
	PaidAt         time.Time `json:"paid_at" gorm:"type:datetime"`
	TransactionID  string    `json:"transaction_id" gorm:"type:varchar(64)"`
	RefundAmount   float64   `json:"refund_amount" gorm:"type:decimal(10,2);not null;default:0"`
	RefundAt       time.Time `json:"refund_at" gorm:"type:datetime"`
	CreatedAt      time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type PaymentModel struct {
	db *sql.DB
}

func NewPaymentModel(db *sql.DB) *PaymentModel {
	return &PaymentModel{db: db}
}

func (m *PaymentModel) Create(payment *Payment) error {
	query := `INSERT INTO ` + PaymentTableName + ` (payment_no, order_id, amount, payment_method, status) VALUES (?, ?, ?, ?, ?)`
	result, err := m.db.Exec(query, payment.PaymentNo, payment.OrderID, payment.Amount, payment.PaymentMethod, payment.Status)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	payment.ID = uint64(id)
	return nil
}

func (m *PaymentModel) GetByID(id uint64) (*Payment, error) {
	query := `SELECT id, payment_no, order_id, amount, payment_method, status, paid_at, transaction_id, refund_amount, refund_at, created_at, updated_at FROM ` + PaymentTableName + ` WHERE id = ?`
	row := m.db.QueryRow(query, id)
	payment := &Payment{}
	err := row.Scan(&payment.ID, &payment.PaymentNo, &payment.OrderID, &payment.Amount, &payment.PaymentMethod, &payment.Status, &payment.PaidAt, &payment.TransactionID, &payment.RefundAmount, &payment.RefundAt, &payment.CreatedAt, &payment.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return payment, nil
}

func (m *PaymentModel) GetByPaymentNo(paymentNo string) (*Payment, error) {
	query := `SELECT id, payment_no, order_id, amount, payment_method, status, paid_at, transaction_id, refund_amount, refund_at, created_at, updated_at FROM ` + PaymentTableName + ` WHERE payment_no = ?`
	row := m.db.QueryRow(query, paymentNo)
	payment := &Payment{}
	err := row.Scan(&payment.ID, &payment.PaymentNo, &payment.OrderID, &payment.Amount, &payment.PaymentMethod, &payment.Status, &payment.PaidAt, &payment.TransactionID, &payment.RefundAmount, &payment.RefundAt, &payment.CreatedAt, &payment.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return payment, nil
}

func (m *PaymentModel) GetByOrderID(orderID uint64) (*Payment, error) {
	query := `SELECT id, payment_no, order_id, amount, payment_method, status, paid_at, transaction_id, refund_amount, refund_at, created_at, updated_at FROM ` + PaymentTableName + ` WHERE order_id = ?`
	row := m.db.QueryRow(query, orderID)
	payment := &Payment{}
	err := row.Scan(&payment.ID, &payment.PaymentNo, &payment.OrderID, &payment.Amount, &payment.PaymentMethod, &payment.Status, &payment.PaidAt, &payment.TransactionID, &payment.RefundAmount, &payment.RefundAt, &payment.CreatedAt, &payment.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return payment, nil
}

func (m *PaymentModel) UpdateStatus(id uint64, status int, transactionID string) error {
	query := `UPDATE ` + PaymentTableName + ` SET status = ?, transaction_id = ?, paid_at = NOW() WHERE id = ?`
	_, err := m.db.Exec(query, status, transactionID, id)
	return err
}

func (m *PaymentModel) Update(payment *Payment) error {
	query := `UPDATE ` + PaymentTableName + ` SET payment_no = ?, order_id = ?, amount = ?, payment_method = ?, status = ?, paid_at = ?, transaction_id = ?, refund_amount = ?, refund_at = ? WHERE id = ?`
	_, err := m.db.Exec(query, payment.PaymentNo, payment.OrderID, payment.Amount, payment.PaymentMethod, payment.Status, payment.PaidAt, payment.TransactionID, payment.RefundAmount, payment.RefundAt, payment.ID)
	return err
}

func (m *PaymentModel) Delete(id uint64) error {
	query := `DELETE FROM ` + PaymentTableName + ` WHERE id = ?`
	_, err := m.db.Exec(query, id)
	return err
}

func (m *PaymentModel) ListByOrderID(orderID uint64) ([]*Payment, error) {
	query := `SELECT id, payment_no, order_id, amount, payment_method, status, paid_at, transaction_id, refund_amount, refund_at, created_at, updated_at FROM ` + PaymentTableName + ` WHERE order_id = ? ORDER BY id DESC`
	rows, err := m.db.Query(query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	payments := make([]*Payment, 0)
	for rows.Next() {
		payment := &Payment{}
		err := rows.Scan(&payment.ID, &payment.PaymentNo, &payment.OrderID, &payment.Amount, &payment.PaymentMethod, &payment.Status, &payment.PaidAt, &payment.TransactionID, &payment.RefundAmount, &payment.RefundAt, &payment.CreatedAt, &payment.UpdatedAt)
		if err != nil {
			return nil, err
		}
		payments = append(payments, payment)
	}
	return payments, nil
}
