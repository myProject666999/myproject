package models

import (
	"database/sql"
	"time"
)

const TimeSlotTableName = "time_slots"

const (
	TimeSlotStatusAvailable = 1
	TimeSlotStatusBooked    = 2
	TimeSlotStatusDisabled  = 0
)

type TimeSlot struct {
	ID         uint64    `json:"id" gorm:"primaryKey;autoIncrement"`
	WorkerID   uint64    `json:"worker_id" gorm:"type:bigint;not null;index"`
	Date       string    `json:"date" gorm:"type:date;not null;index"`
	StartTime  string    `json:"start_time" gorm:"type:time;not null"`
	EndTime    string    `json:"end_time" gorm:"type:time;not null"`
	Status     int       `json:"status" gorm:"type:tinyint;not null;default:1"`
	OrderID    uint64    `json:"order_id" gorm:"type:bigint;index"`
	CreatedAt  time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type TimeSlotModel struct {
	db *sql.DB
}

func NewTimeSlotModel(db *sql.DB) *TimeSlotModel {
	return &TimeSlotModel{db: db}
}

func (m *TimeSlotModel) Create(slot *TimeSlot) error {
	query := `INSERT INTO ` + TimeSlotTableName + ` (worker_id, date, start_time, end_time, status, order_id) VALUES (?, ?, ?, ?, ?, ?)`
	result, err := m.db.Exec(query, slot.WorkerID, slot.Date, slot.StartTime, slot.EndTime, slot.Status, slot.OrderID)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	slot.ID = uint64(id)
	return nil
}

func (m *TimeSlotModel) GetByID(id uint64) (*TimeSlot, error) {
	query := `SELECT id, worker_id, date, start_time, end_time, status, order_id, created_at, updated_at FROM ` + TimeSlotTableName + ` WHERE id = ?`
	row := m.db.QueryRow(query, id)
	slot := &TimeSlot{}
	err := row.Scan(&slot.ID, &slot.WorkerID, &slot.Date, &slot.StartTime, &slot.EndTime, &slot.Status, &slot.OrderID, &slot.CreatedAt, &slot.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return slot, nil
}

func (m *TimeSlotModel) Update(slot *TimeSlot) error {
	query := `UPDATE ` + TimeSlotTableName + ` SET worker_id = ?, date = ?, start_time = ?, end_time = ?, status = ?, order_id = ? WHERE id = ?`
	_, err := m.db.Exec(query, slot.WorkerID, slot.Date, slot.StartTime, slot.EndTime, slot.Status, slot.OrderID, slot.ID)
	return err
}

func (m *TimeSlotModel) UpdateStatus(id uint64, status int, orderID uint64) error {
	query := `UPDATE ` + TimeSlotTableName + ` SET status = ?, order_id = ? WHERE id = ?`
	_, err := m.db.Exec(query, status, orderID, id)
	return err
}

func (m *TimeSlotModel) Delete(id uint64) error {
	query := `DELETE FROM ` + TimeSlotTableName + ` WHERE id = ?`
	_, err := m.db.Exec(query, id)
	return err
}

func (m *TimeSlotModel) DeleteByDateRange(workerID uint64, startDate, endDate string) error {
	query := `DELETE FROM ` + TimeSlotTableName + ` WHERE worker_id = ? AND date >= ? AND date <= ?`
	_, err := m.db.Exec(query, workerID, startDate, endDate)
	return err
}

func (m *TimeSlotModel) ListByWorkerIDAndDate(workerID uint64, date string) ([]*TimeSlot, error) {
	query := `SELECT id, worker_id, date, start_time, end_time, status, order_id, created_at, updated_at FROM ` + TimeSlotTableName + ` WHERE worker_id = ? AND date = ? ORDER BY start_time ASC`
	rows, err := m.db.Query(query, workerID, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	slots := make([]*TimeSlot, 0)
	for rows.Next() {
		slot := &TimeSlot{}
		err := rows.Scan(&slot.ID, &slot.WorkerID, &slot.Date, &slot.StartTime, &slot.EndTime, &slot.Status, &slot.OrderID, &slot.CreatedAt, &slot.UpdatedAt)
		if err != nil {
			return nil, err
		}
		slots = append(slots, slot)
	}
	return slots, nil
}

func (m *TimeSlotModel) ListAvailableByWorkerIDAndDate(workerID uint64, date string) ([]*TimeSlot, error) {
	query := `SELECT id, worker_id, date, start_time, end_time, status, order_id, created_at, updated_at FROM ` + TimeSlotTableName + ` WHERE worker_id = ? AND date = ? AND status = 1 ORDER BY start_time ASC`
	rows, err := m.db.Query(query, workerID, date)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	slots := make([]*TimeSlot, 0)
	for rows.Next() {
		slot := &TimeSlot{}
		err := rows.Scan(&slot.ID, &slot.WorkerID, &slot.Date, &slot.StartTime, &slot.EndTime, &slot.Status, &slot.OrderID, &slot.CreatedAt, &slot.UpdatedAt)
		if err != nil {
			return nil, err
		}
		slots = append(slots, slot)
	}
	return slots, nil
}

func (m *TimeSlotModel) ListByWorkerIDAndDateRange(workerID uint64, startDate, endDate string) ([]*TimeSlot, error) {
	query := `SELECT id, worker_id, date, start_time, end_time, status, order_id, created_at, updated_at FROM ` + TimeSlotTableName + ` WHERE worker_id = ? AND date >= ? AND date <= ? ORDER BY date ASC, start_time ASC`
	rows, err := m.db.Query(query, workerID, startDate, endDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	slots := make([]*TimeSlot, 0)
	for rows.Next() {
		slot := &TimeSlot{}
		err := rows.Scan(&slot.ID, &slot.WorkerID, &slot.Date, &slot.StartTime, &slot.EndTime, &slot.Status, &slot.OrderID, &slot.CreatedAt, &slot.UpdatedAt)
		if err != nil {
			return nil, err
		}
		slots = append(slots, slot)
	}
	return slots, nil
}

func (m *TimeSlotModel) BatchCreate(slots []*TimeSlot) error {
	tx, err := m.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO ` + TimeSlotTableName + ` (worker_id, date, start_time, end_time, status, order_id) VALUES (?, ?, ?, ?, ?, ?)`
	stmt, err := tx.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, slot := range slots {
		_, err := stmt.Exec(slot.WorkerID, slot.Date, slot.StartTime, slot.EndTime, slot.Status, slot.OrderID)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}
