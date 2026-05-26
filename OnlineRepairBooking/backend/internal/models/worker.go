package models

import (
	"database/sql"
	"time"
)

const WorkerTableName = "workers"
const WorkerSkillTableName = "worker_skills"

const (
	WorkerStatusPending  = 0
	WorkerStatusApproved = 1
	WorkerStatusRejected = 2
	WorkerStatusDisabled = 3
)

type Worker struct {
	ID             uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID         uint64    `json:"user_id" gorm:"type:bigint;not null;unique;index"`
	RealName       string    `json:"real_name" gorm:"type:varchar(50);not null"`
	IDCard         string    `json:"id_card" gorm:"type:varchar(18);not null;unique"`
	Phone          string    `json:"phone" gorm:"type:varchar(20);not null"`
	IDCardFront    string    `json:"id_card_front" gorm:"type:varchar(255)"`
	IDCardBack     string    `json:"id_card_back" gorm:"type:varchar(255)"`
	Certificate    string    `json:"certificate" gorm:"type:varchar(255)"`
	Intro          string    `json:"intro" gorm:"type:text"`
	Experience     int       `json:"experience" gorm:"type:int;default:0"`
	Rating         float64   `json:"rating" gorm:"type:decimal(3,2);default:5.0"`
	OrderCount     int       `json:"order_count" gorm:"type:int;default:0"`
	ReviewCount    int       `json:"review_count" gorm:"type:int;default:0"`
	Status         int       `json:"status" gorm:"type:tinyint;not null;default:0"`
	RejectReason   string    `json:"reject_reason" gorm:"type:varchar(255)"`
	ApprovedAt     time.Time `json:"approved_at" gorm:"type:datetime"`
	CreatedAt      time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type WorkerSkill struct {
	ID         uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	WorkerID   uint64    `json:"worker_id" gorm:"type:bigint;not null;index"`
	ServiceID  uint64    `json:"service_id" gorm:"type:bigint;not null;index"`
	Proficiency int      `json:"proficiency" gorm:"type:tinyint;default:5"`
	CreatedAt  time.Time `json:"created_at" gorm:"autoCreateTime"`
}

type WorkerModel struct {
	db *sql.DB
}

type WorkerSkillModel struct {
	db *sql.DB
}

func NewWorkerModel(db *sql.DB) *WorkerModel {
	return &WorkerModel{db: db}
}

func NewWorkerSkillModel(db *sql.DB) *WorkerSkillModel {
	return &WorkerSkillModel{db: db}
}

func (m *WorkerModel) Create(worker *Worker) error {
	query := `INSERT INTO ` + WorkerTableName + ` (user_id, real_name, id_card, phone, id_card_front, id_card_back, certificate, intro, experience, rating, order_count, review_count, status, reject_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	result, err := m.db.Exec(query, worker.UserID, worker.RealName, worker.IDCard, worker.Phone, worker.IDCardFront, worker.IDCardBack, worker.Certificate, worker.Intro, worker.Experience, worker.Rating, worker.OrderCount, worker.ReviewCount, worker.Status, worker.RejectReason)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	worker.ID = uint64(id)
	return nil
}

func (m *WorkerModel) GetByID(id uint64) (*Worker, error) {
	query := `SELECT id, user_id, real_name, id_card, phone, id_card_front, id_card_back, certificate, intro, experience, rating, order_count, review_count, status, reject_reason, approved_at, created_at, updated_at FROM ` + WorkerTableName + ` WHERE id = ?`
	row := m.db.QueryRow(query, id)
	worker := &Worker{}
	err := row.Scan(&worker.ID, &worker.UserID, &worker.RealName, &worker.IDCard, &worker.Phone, &worker.IDCardFront, &worker.IDCardBack, &worker.Certificate, &worker.Intro, &worker.Experience, &worker.Rating, &worker.OrderCount, &worker.ReviewCount, &worker.Status, &worker.RejectReason, &worker.ApprovedAt, &worker.CreatedAt, &worker.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return worker, nil
}

func (m *WorkerModel) GetByUserID(userID uint64) (*Worker, error) {
	query := `SELECT id, user_id, real_name, id_card, phone, id_card_front, id_card_back, certificate, intro, experience, rating, order_count, review_count, status, reject_reason, approved_at, created_at, updated_at FROM ` + WorkerTableName + ` WHERE user_id = ?`
	row := m.db.QueryRow(query, userID)
	worker := &Worker{}
	err := row.Scan(&worker.ID, &worker.UserID, &worker.RealName, &worker.IDCard, &worker.Phone, &worker.IDCardFront, &worker.IDCardBack, &worker.Certificate, &worker.Intro, &worker.Experience, &worker.Rating, &worker.OrderCount, &worker.ReviewCount, &worker.Status, &worker.RejectReason, &worker.ApprovedAt, &worker.CreatedAt, &worker.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return worker, nil
}

func (m *WorkerModel) Update(worker *Worker) error {
	query := `UPDATE ` + WorkerTableName + ` SET real_name = ?, id_card = ?, phone = ?, id_card_front = ?, id_card_back = ?, certificate = ?, intro = ?, experience = ?, rating = ?, order_count = ?, review_count = ?, status = ?, reject_reason = ?, approved_at = ? WHERE id = ?`
	_, err := m.db.Exec(query, worker.RealName, worker.IDCard, worker.Phone, worker.IDCardFront, worker.IDCardBack, worker.Certificate, worker.Intro, worker.Experience, worker.Rating, worker.OrderCount, worker.ReviewCount, worker.Status, worker.RejectReason, worker.ApprovedAt, worker.ID)
	return err
}

func (m *WorkerModel) Delete(id uint64) error {
	query := `DELETE FROM ` + WorkerTableName + ` WHERE id = ?`
	_, err := m.db.Exec(query, id)
	return err
}

func (m *WorkerModel) List(status int, page, pageSize int) ([]*Worker, int64, error) {
	var total int64
	countQuery := `SELECT COUNT(*) FROM ` + WorkerTableName
	args := []interface{}{}
	if status >= 0 {
		countQuery += ` WHERE status = ?`
		args = append(args, status)
	}
	err := m.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	query := `SELECT id, user_id, real_name, id_card, phone, id_card_front, id_card_back, certificate, intro, experience, rating, order_count, review_count, status, reject_reason, approved_at, created_at, updated_at FROM ` + WorkerTableName
	if status >= 0 {
		query += ` WHERE status = ?`
	}
	query += ` ORDER BY id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)
	rows, err := m.db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	workers := make([]*Worker, 0)
	for rows.Next() {
		worker := &Worker{}
		err := rows.Scan(&worker.ID, &worker.UserID, &worker.RealName, &worker.IDCard, &worker.Phone, &worker.IDCardFront, &worker.IDCardBack, &worker.Certificate, &worker.Intro, &worker.Experience, &worker.Rating, &worker.OrderCount, &worker.ReviewCount, &worker.Status, &worker.RejectReason, &worker.ApprovedAt, &worker.CreatedAt, &worker.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		workers = append(workers, worker)
	}
	return workers, total, nil
}

func (m *WorkerSkillModel) Create(skill *WorkerSkill) error {
	query := `INSERT INTO ` + WorkerSkillTableName + ` (worker_id, service_id, proficiency) VALUES (?, ?, ?)`
	result, err := m.db.Exec(query, skill.WorkerID, skill.ServiceID, skill.Proficiency)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	skill.ID = uint64(id)
	return nil
}

func (m *WorkerSkillModel) GetByID(id uint64) (*WorkerSkill, error) {
	query := `SELECT id, worker_id, service_id, proficiency, created_at FROM ` + WorkerSkillTableName + ` WHERE id = ?`
	row := m.db.QueryRow(query, id)
	skill := &WorkerSkill{}
	err := row.Scan(&skill.ID, &skill.WorkerID, &skill.ServiceID, &skill.Proficiency, &skill.CreatedAt)
	if err != nil {
		return nil, err
	}
	return skill, nil
}

func (m *WorkerSkillModel) ListByWorkerID(workerID uint64) ([]*WorkerSkill, error) {
	query := `SELECT id, worker_id, service_id, proficiency, created_at FROM ` + WorkerSkillTableName + ` WHERE worker_id = ?`
	rows, err := m.db.Query(query, workerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	skills := make([]*WorkerSkill, 0)
	for rows.Next() {
		skill := &WorkerSkill{}
		err := rows.Scan(&skill.ID, &skill.WorkerID, &skill.ServiceID, &skill.Proficiency, &skill.CreatedAt)
		if err != nil {
			return nil, err
		}
		skills = append(skills, skill)
	}
	return skills, nil
}

func (m *WorkerSkillModel) Delete(id uint64) error {
	query := `DELETE FROM ` + WorkerSkillTableName + ` WHERE id = ?`
	_, err := m.db.Exec(query, id)
	return err
}

func (m *WorkerSkillModel) DeleteByWorkerID(workerID uint64) error {
	query := `DELETE FROM ` + WorkerSkillTableName + ` WHERE worker_id = ?`
	_, err := m.db.Exec(query, workerID)
	return err
}

func (m *WorkerModel) UpdateRating(workerID uint64, rating float64, reviewCount int) error {
	query := `UPDATE ` + WorkerTableName + ` SET rating = ?, review_count = ? WHERE id = ?`
	_, err := m.db.Exec(query, rating, reviewCount, workerID)
	return err
}
