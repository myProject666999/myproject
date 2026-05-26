package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"online-repair-booking/pkg/database"

	"github.com/redis/go-redis/v9"
)

const (
	OrderStatusPending   = 0
	OrderStatusAccepted  = 1
	OrderStatusInService = 2
	OrderStatusToReview  = 3
	OrderStatusCompleted = 4
	OrderStatusCancelled = 5
)

const (
	OperatorTypeUser   = 1
	OperatorTypeWorker = 2
	OperatorTypeSystem = 3
)

var validTransitions = map[int][]int{
	OrderStatusPending:   {OrderStatusAccepted, OrderStatusCancelled},
	OrderStatusAccepted:  {OrderStatusInService, OrderStatusCancelled},
	OrderStatusInService: {OrderStatusToReview, OrderStatusCancelled},
	OrderStatusToReview:  {OrderStatusCompleted, OrderStatusCancelled},
	OrderStatusCompleted: {},
	OrderStatusCancelled: {},
}

type OrderStateMachine struct {
	db          *sql.DB
	redisClient *redis.Client
}

type OrderState struct {
	ID         uint64 `json:"id"`
	OrderNo    string `json:"order_no"`
	Status     int    `json:"status"`
	WorkerID   uint64 `json:"worker_id"`
	UpdatedAt  string `json:"updated_at"`
}

func NewOrderStateMachine(db *sql.DB) *OrderStateMachine {
	return &OrderStateMachine{
		db:          db,
		redisClient: database.RedisClient,
	}
}

func (s *OrderStateMachine) TransitionOrder(orderID, newStatus, operatorID, operatorType int64, remark string) error {
	lockKey := fmt.Sprintf("order:lock:%d", orderID)
	locked, err := s.redisClient.SetNX(database.Ctx, lockKey, "1", 10*time.Second).Result()
	if err != nil {
		return fmt.Errorf("获取订单锁失败: %w", err)
	}
	if !locked {
		return fmt.Errorf("订单正在处理中，请稍后再试")
	}
	defer s.redisClient.Del(database.Ctx, lockKey)

	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("创建事务失败: %w", err)
	}
	defer tx.Rollback()

	var oldStatus int
	var orderNo string
	var currentWorkerID uint64

	orderQuery := `SELECT id, order_no, status, worker_id FROM orders WHERE id = ? FOR UPDATE`
	err = tx.QueryRow(orderQuery, orderID).Scan(&orderID, &orderNo, &oldStatus, &currentWorkerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("订单不存在")
		}
		return fmt.Errorf("获取订单信息失败: %w", err)
	}

	if !s.isValidTransition(oldStatus, int(newStatus)) {
		return fmt.Errorf("无效的状态转换: %d → %d", oldStatus, newStatus)
	}

	updateFields := "status = ?"
	updateArgs := []interface{}{newStatus, orderID}

	switch int(newStatus) {
	case OrderStatusAccepted:
		updateFields += ", accepted_at = NOW()"
	case OrderStatusInService:
		updateFields += ", started_at = NOW()"
	case OrderStatusToReview:
		updateFields += ", completed_at = NOW()"
	case OrderStatusCompleted:
		updateFields += ", completed_at = NOW()"
	case OrderStatusCancelled:
		updateFields += ", cancelled_at = NOW()"
		if remark != "" {
			updateFields += ", cancel_reason = ?"
			updateArgs = []interface{}{newStatus, remark, orderID}
		}
	}

	updateQuery := fmt.Sprintf("UPDATE orders SET %s WHERE id = ?", updateFields)
	_, err = tx.Exec(updateQuery, updateArgs...)
	if err != nil {
		return fmt.Errorf("更新订单状态失败: %w", err)
	}

	logQuery := `INSERT INTO order_status_logs (order_id, old_status, new_status, operator_id, operator_type, remark) VALUES (?, ?, ?, ?, ?, ?)`
	_, err = tx.Exec(logQuery, orderID, oldStatus, newStatus, operatorID, operatorType, remark)
	if err != nil {
		return fmt.Errorf("插入状态日志失败: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("提交事务失败: %w", err)
	}

	state := &OrderState{
		ID:        uint64(orderID),
		OrderNo:   orderNo,
		Status:    int(newStatus),
		WorkerID:  currentWorkerID,
		UpdatedAt: time.Now().Format("2006-01-02 15:04:05"),
	}
	s.cacheOrderState(state)

	s.publishStateChangeEvent(uint64(orderID), oldStatus, int(newStatus), uint64(operatorID), int(operatorType))

	return nil
}

func (s *OrderStateMachine) GetOrderStatus(orderID uint64) (int, error) {
	cacheKey := fmt.Sprintf("order:status:%d", orderID)
	cachedStatus, err := s.redisClient.Get(database.Ctx, cacheKey).Result()
	if err == nil && cachedStatus != "" {
		var state OrderState
		if err := json.Unmarshal([]byte(cachedStatus), &state); err == nil {
			return state.Status, nil
		}
	}

	var status int
	query := `SELECT status FROM orders WHERE id = ?`
	err = s.db.QueryRow(query, orderID).Scan(&status)
	if err != nil {
		return -1, fmt.Errorf("获取订单状态失败: %w", err)
	}

	var orderNo string
	var workerID uint64
	query2 := `SELECT order_no, worker_id FROM orders WHERE id = ?`
	_ = s.db.QueryRow(query2, orderID).Scan(&orderNo, &workerID)

	state := &OrderState{
		ID:        orderID,
		OrderNo:   orderNo,
		Status:    status,
		WorkerID:  workerID,
		UpdatedAt: time.Now().Format("2006-01-02 15:04:05"),
	}
	s.cacheOrderState(state)

	return status, nil
}

func (s *OrderStateMachine) isValidTransition(oldStatus, newStatus int) bool {
	if newStatus == OrderStatusCancelled {
		return oldStatus != OrderStatusCompleted && oldStatus != OrderStatusCancelled
	}

	validNext, exists := validTransitions[oldStatus]
	if !exists {
		return false
	}

	for _, s := range validNext {
		if s == newStatus {
			return true
		}
	}
	return false
}

func (s *OrderStateMachine) cacheOrderState(state *OrderState) {
	cacheKey := fmt.Sprintf("order:status:%d", state.ID)
	stateJSON, _ := json.Marshal(state)
	s.redisClient.SetEx(database.Ctx, cacheKey, stateJSON, 30*time.Minute)
}

func (s *OrderStateMachine) publishStateChangeEvent(orderID uint64, oldStatus, newStatus int, operatorID uint64, operatorType int) {
	eventData := map[string]interface{}{
		"type":          "order_status_changed",
		"order_id":      orderID,
		"old_status":    oldStatus,
		"new_status":    newStatus,
		"operator_id":   operatorID,
		"operator_type": operatorType,
		"timestamp":     time.Now().Unix(),
	}
	eventJSON, _ := json.Marshal(eventData)
	s.redisClient.Publish(database.Ctx, "order:events", eventJSON)
}

func GetStatusName(status int) string {
	switch status {
	case OrderStatusPending:
		return "待接单"
	case OrderStatusAccepted:
		return "待服务"
	case OrderStatusInService:
		return "服务中"
	case OrderStatusToReview:
		return "待评价"
	case OrderStatusCompleted:
		return "已完成"
	case OrderStatusCancelled:
		return "已取消"
	default:
		return "未知状态"
	}
}

func GetTransitionErrorMsg(oldStatus, newStatus int) string {
	return fmt.Sprintf("当前订单状态为「%s」，无法执行此操作", GetStatusName(oldStatus))
}
