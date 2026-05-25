package statemachine

import (
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type Transition struct {
	FromStatus   string
	ToStatus     string
	Action       string
	ActionName   string
	AllowedRoles string
}

type StateMachine struct {
	db          *sql.DB
	transitions []Transition
	statusMap   map[string]string
}

func NewStateMachine(db *sql.DB) *StateMachine {
	sm := &StateMachine{
		db:        db,
		statusMap: make(map[string]string),
	}
	sm.loadTransitions()
	sm.loadStatusMap()
	return sm
}

func (sm *StateMachine) loadTransitions() {
	rows, err := sm.db.Query(`SELECT from_status, to_status, action, action_name, allowed_roles FROM ticket_status_transition`)
	if err != nil {
		return
	}
	defer rows.Close()
	for rows.Next() {
		var t Transition
		rows.Scan(&t.FromStatus, &t.ToStatus, &t.Action, &t.ActionName, &t.AllowedRoles)
		sm.transitions = append(sm.transitions, t)
	}
}

func (sm *StateMachine) loadStatusMap() {
	rows, err := sm.db.Query(`SELECT code, name FROM ticket_status`)
	if err != nil {
		return
	}
	defer rows.Close()
	for rows.Next() {
		var code, name string
		rows.Scan(&code, &name)
		sm.statusMap[code] = name
	}
}

func (sm *StateMachine) CanTransition(fromStatus, action string, role int) bool {
	for _, t := range sm.transitions {
		if t.FromStatus == fromStatus && t.Action == action {
			roles := strings.Split(t.AllowedRoles, ",")
			for _, r := range roles {
				if fmt.Sprintf("%d", role) == strings.TrimSpace(r) {
					return true
				}
			}
		}
	}
	return false
}

func (sm *StateMachine) GetNextStatus(fromStatus, action string) (string, string, bool) {
	for _, t := range sm.transitions {
		if t.FromStatus == fromStatus && t.Action == action {
			return t.ToStatus, t.ActionName, true
		}
	}
	return "", "", false
}

func (sm *StateMachine) GetAvailableActions(status string, role int) []map[string]string {
	var actions []map[string]string
	for _, t := range sm.transitions {
		if t.FromStatus == status {
			roles := strings.Split(t.AllowedRoles, ",")
			for _, r := range roles {
				if fmt.Sprintf("%d", role) == strings.TrimSpace(r) {
					actions = append(actions, map[string]string{
						"action":     t.Action,
						"actionName": t.ActionName,
						"toStatus":   t.ToStatus,
					})
					break
				}
			}
		}
	}
	return actions
}

func (sm *StateMachine) ExecuteTransition(tx *sql.Tx, ticketId int64, fromStatus, action string, operatorId int64, operatorRole int, operatorName string, content string) error {
	toStatus, _, ok := sm.GetNextStatus(fromStatus, action)
	if !ok {
		return fmt.Errorf("invalid transition: %s -> %s", fromStatus, action)
	}

	now := time.Now()

	result, err := tx.Exec(`UPDATE ticket SET status_code = ?, updated_at = ? WHERE id = ?`, toStatus, now, ticketId)
	if err != nil {
		return err
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("ticket not found: %d", ticketId)
	}

	if action == "resolve" {
		tx.Exec(`UPDATE ticket SET resolved_at = ? WHERE id = ?`, now, ticketId)
	}
	if action == "close" {
		tx.Exec(`UPDATE ticket SET closed_at = ? WHERE id = ?`, now, ticketId)
	}
	if action == "assign" || action == "claim" {
		tx.Exec(`UPDATE ticket SET assigned_at = ? WHERE id = ?`, now, ticketId)
	}

	_, err = tx.Exec(`INSERT INTO ticket_operation_log (ticket_id, operation_type, from_status, to_status, operator_id, operator_role, operator_name, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		ticketId, "transition", fromStatus, toStatus, operatorId, operatorRole, operatorName, content, now)
	if err != nil {
		return err
	}

	return nil
}

func (sm *StateMachine) LogOperation(tx *sql.Tx, ticketId int64, operationType string, fromStatus, toStatus *string, operatorId int64, operatorRole int, operatorName string, content string) error {
	now := time.Now()
	_, err := tx.Exec(`INSERT INTO ticket_operation_log (ticket_id, operation_type, from_status, to_status, operator_id, operator_role, operator_name, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		ticketId, operationType, fromStatus, toStatus, operatorId, operatorRole, operatorName, content, now)
	return err
}

func (sm *StateMachine) IsFinalStatus(status string) bool {
	var isFinal int
	err := sm.db.QueryRow(`SELECT is_final FROM ticket_status WHERE code = ?`, status).Scan(&isFinal)
	if err != nil {
		return false
	}
	return isFinal == 1
}

func (sm *StateMachine) GetStatusName(code string) string {
	if name, ok := sm.statusMap[code]; ok {
		return name
	}
	return code
}
