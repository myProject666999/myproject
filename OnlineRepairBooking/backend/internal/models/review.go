package models

import (
	"database/sql"
	"time"
)

const ReviewTableName = "reviews"

type Review struct {
	ID           uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	OrderID      uint64    `json:"order_id" gorm:"type:bigint;not null;unique;index"`
	UserID       uint64    `json:"user_id" gorm:"type:bigint;not null;index"`
	WorkerID     uint64    `json:"worker_id" gorm:"type:bigint;not null;index"`
	ServiceID    uint64    `json:"service_id" gorm:"type:bigint;not null"`
	Rating       int       `json:"rating" gorm:"type:tinyint;not null;default:5"`
	Content      string    `json:"content" gorm:"type:text"`
	Images       string    `json:"images" gorm:"type:varchar(1000)"`
	IsAnonymous  int       `json:"is_anonymous" gorm:"type:tinyint;not null;default:0"`
	ReplyContent string    `json:"reply_content" gorm:"type:text"`
	ReplyAt      time.Time `json:"reply_at" gorm:"type:datetime"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type ReviewModel struct {
	db *sql.DB
}

func NewReviewModel(db *sql.DB) *ReviewModel {
	return &ReviewModel{db: db}
}

func (m *ReviewModel) Create(review *Review) error {
	query := `INSERT INTO ` + ReviewTableName + ` (order_id, user_id, worker_id, service_id, rating, content, images, is_anonymous) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	result, err := m.db.Exec(query, review.OrderID, review.UserID, review.WorkerID, review.ServiceID, review.Rating, review.Content, review.Images, review.IsAnonymous)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	review.ID = uint64(id)
	return nil
}

func (m *ReviewModel) GetByID(id uint64) (*Review, error) {
	query := `SELECT id, order_id, user_id, worker_id, service_id, rating, content, images, is_anonymous, reply_content, reply_at, created_at, updated_at FROM ` + ReviewTableName + ` WHERE id = ?`
	row := m.db.QueryRow(query, id)
	review := &Review{}
	err := row.Scan(&review.ID, &review.OrderID, &review.UserID, &review.WorkerID, &review.ServiceID, &review.Rating, &review.Content, &review.Images, &review.IsAnonymous, &review.ReplyContent, &review.ReplyAt, &review.CreatedAt, &review.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return review, nil
}

func (m *ReviewModel) GetByOrderID(orderID uint64) (*Review, error) {
	query := `SELECT id, order_id, user_id, worker_id, service_id, rating, content, images, is_anonymous, reply_content, reply_at, created_at, updated_at FROM ` + ReviewTableName + ` WHERE order_id = ?`
	row := m.db.QueryRow(query, orderID)
	review := &Review{}
	err := row.Scan(&review.ID, &review.OrderID, &review.UserID, &review.WorkerID, &review.ServiceID, &review.Rating, &review.Content, &review.Images, &review.IsAnonymous, &review.ReplyContent, &review.ReplyAt, &review.CreatedAt, &review.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return review, nil
}

func (m *ReviewModel) UpdateReply(id uint64, replyContent string) error {
	query := `UPDATE ` + ReviewTableName + ` SET reply_content = ?, reply_at = NOW() WHERE id = ?`
	_, err := m.db.Exec(query, replyContent, id)
	return err
}

func (m *ReviewModel) Delete(id uint64) error {
	query := `DELETE FROM ` + ReviewTableName + ` WHERE id = ?`
	_, err := m.db.Exec(query, id)
	return err
}

func (m *ReviewModel) ListByWorkerID(workerID uint64, page, pageSize int) ([]*Review, int64, error) {
	var total int64
	countQuery := `SELECT COUNT(*) FROM ` + ReviewTableName + ` WHERE worker_id = ?`
	err := m.db.QueryRow(countQuery, workerID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	query := `SELECT id, order_id, user_id, worker_id, service_id, rating, content, images, is_anonymous, reply_content, reply_at, created_at, updated_at FROM ` + ReviewTableName + ` WHERE worker_id = ? ORDER BY id DESC LIMIT ? OFFSET ?`
	rows, err := m.db.Query(query, workerID, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	reviews := make([]*Review, 0)
	for rows.Next() {
		review := &Review{}
		err := rows.Scan(&review.ID, &review.OrderID, &review.UserID, &review.WorkerID, &review.ServiceID, &review.Rating, &review.Content, &review.Images, &review.IsAnonymous, &review.ReplyContent, &review.ReplyAt, &review.CreatedAt, &review.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		reviews = append(reviews, review)
	}
	return reviews, total, nil
}

func (m *ReviewModel) ListByServiceID(serviceID uint64, page, pageSize int) ([]*Review, int64, error) {
	var total int64
	countQuery := `SELECT COUNT(*) FROM ` + ReviewTableName + ` WHERE service_id = ?`
	err := m.db.QueryRow(countQuery, serviceID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	query := `SELECT id, order_id, user_id, worker_id, service_id, rating, content, images, is_anonymous, reply_content, reply_at, created_at, updated_at FROM ` + ReviewTableName + ` WHERE service_id = ? ORDER BY id DESC LIMIT ? OFFSET ?`
	rows, err := m.db.Query(query, serviceID, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	reviews := make([]*Review, 0)
	for rows.Next() {
		review := &Review{}
		err := rows.Scan(&review.ID, &review.OrderID, &review.UserID, &review.WorkerID, &review.ServiceID, &review.Rating, &review.Content, &review.Images, &review.IsAnonymous, &review.ReplyContent, &review.ReplyAt, &review.CreatedAt, &review.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		reviews = append(reviews, review)
	}
	return reviews, total, nil
}

func (m *ReviewModel) ListByUserID(userID uint64, page, pageSize int) ([]*Review, int64, error) {
	var total int64
	countQuery := `SELECT COUNT(*) FROM ` + ReviewTableName + ` WHERE user_id = ?`
	err := m.db.QueryRow(countQuery, userID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	query := `SELECT id, order_id, user_id, worker_id, service_id, rating, content, images, is_anonymous, reply_content, reply_at, created_at, updated_at FROM ` + ReviewTableName + ` WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?`
	rows, err := m.db.Query(query, userID, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	reviews := make([]*Review, 0)
	for rows.Next() {
		review := &Review{}
		err := rows.Scan(&review.ID, &review.OrderID, &review.UserID, &review.WorkerID, &review.ServiceID, &review.Rating, &review.Content, &review.Images, &review.IsAnonymous, &review.ReplyContent, &review.ReplyAt, &review.CreatedAt, &review.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		reviews = append(reviews, review)
	}
	return reviews, total, nil
}

func (m *ReviewModel) GetAverageRating(workerID uint64) (float64, int64, error) {
	var avgRating float64
	var count int64
	query := `SELECT AVG(rating), COUNT(*) FROM ` + ReviewTableName + ` WHERE worker_id = ?`
	err := m.db.QueryRow(query, workerID).Scan(&avgRating, &count)
	if err != nil {
		return 0, 0, err
	}
	return avgRating, count, nil
}
