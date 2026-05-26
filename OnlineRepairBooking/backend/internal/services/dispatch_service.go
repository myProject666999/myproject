package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"online-repair-booking/pkg/database"
)

type DispatchService struct {
	db *sql.DB
}

type WorkerMatch struct {
	ID                uint64  `json:"id"`
	UserID            uint64  `json:"user_id"`
	RealName          string  `json:"real_name"`
	Avatar            string  `json:"avatar"`
	Phone             string  `json:"phone"`
	Province          string  `json:"province"`
	City              string  `json:"city"`
	Rating            float64 `json:"rating"`
	OrderCount        int     `json:"order_count"`
	Level             int     `json:"level"`
	IsCertified       int     `json:"is_certified"`
	Status            int     `json:"status"`
	Distance          float64 `json:"distance"`
}

type OrderInfo struct {
	ID               uint64 `json:"id"`
	OrderNo          string `json:"order_no"`
	UserID           uint64 `json:"user_id"`
	ServiceID        uint64 `json:"service_id"`
	CategoryID       uint64 `json:"category_id"`
	City             string `json:"city"`
	AppointmentDate  string `json:"appointment_date"`
	AppointmentTime  string `json:"appointment_time"`
	Status           int    `json:"status"`
}

func NewDispatchService(db *sql.DB) *DispatchService {
	return &DispatchService{db: db}
}

func (s *DispatchService) FindMatchingWorkers(orderID uint64) ([]*WorkerMatch, error) {
	order, err := s.getOrderInfo(orderID)
	if err != nil {
		return nil, fmt.Errorf("获取订单信息失败: %w", err)
	}

	if order.Status != 0 {
		return nil, fmt.Errorf("订单状态不是待接单")
	}

	cacheKey := fmt.Sprintf("workers:available:%s:%d", order.City, order.CategoryID)
	cachedWorkers, err := database.RedisClient.Get(database.Ctx, cacheKey).Result()
	if err == nil && cachedWorkers != "" {
		var workers []*WorkerMatch
		if err := json.Unmarshal([]byte(cachedWorkers), &workers); err == nil {
			availableWorkers := make([]*WorkerMatch, 0)
			for _, w := range workers {
				if available, _ := s.CheckWorkerAvailability(w.ID, order.AppointmentDate, order.AppointmentTime); available {
					availableWorkers = append(availableWorkers, w)
				}
			}
			return availableWorkers, nil
		}
	}

	query := `SELECT DISTINCT w.id, w.user_id, w.real_name, w.avatar, w.phone, w.province, 
	          w.city, w.rating, w.order_count, w.level, w.is_certified, w.status
	          FROM workers w
	          INNER JOIN worker_skills ws ON w.id = ws.worker_id
	          WHERE w.city = ? AND ws.category_id = ? AND w.status = 1
	          ORDER BY w.rating DESC, w.order_count DESC`

	rows, err := s.db.Query(query, order.City, order.CategoryID)
	if err != nil {
		return nil, fmt.Errorf("查询匹配工人失败: %w", err)
	}
	defer rows.Close()

	workers := make([]*WorkerMatch, 0)
	for rows.Next() {
		worker := &WorkerMatch{}
		err := rows.Scan(&worker.ID, &worker.UserID, &worker.RealName, &worker.Avatar,
			&worker.Phone, &worker.Province, &worker.City, &worker.Rating, &worker.OrderCount,
			&worker.Level, &worker.IsCertified, &worker.Status)
		if err != nil {
			return nil, fmt.Errorf("解析工人数据失败: %w", err)
		}
		worker.Distance = 0
		workers = append(workers, worker)
	}

	availableWorkers := make([]*WorkerMatch, 0)
	for _, w := range workers {
		if available, _ := s.CheckWorkerAvailability(w.ID, order.AppointmentDate, order.AppointmentTime); available {
			availableWorkers = append(availableWorkers, w)
		}
	}

	if len(workers) > 0 {
		workersJSON, _ := json.Marshal(workers)
		database.RedisClient.SetEx(database.Ctx, cacheKey, workersJSON, 5*time.Minute)
	}

	return availableWorkers, nil
}

func (s *DispatchService) GetBestWorker(orderID uint64) (*WorkerMatch, error) {
	workers, err := s.FindMatchingWorkers(orderID)
	if err != nil {
		return nil, err
	}

	if len(workers) == 0 {
		return nil, fmt.Errorf("没有匹配的工人")
	}

	bestWorker := workers[0]
	bestScore := s.calculateWorkerScore(bestWorker)

	for _, w := range workers[1:] {
		score := s.calculateWorkerScore(w)
		if score > bestScore {
			bestScore = score
			bestWorker = w
		}
	}

	return bestWorker, nil
}

func (s *DispatchService) CheckWorkerAvailability(workerID uint64, date string, timeSlot string) (bool, error) {
	query := `SELECT COUNT(*) FROM orders 
	          WHERE worker_id = ? AND appointment_date = ? 
	          AND appointment_time = ? AND status NOT IN (4, 5)`

	var count int
	err := s.db.QueryRow(query, workerID, date, timeSlot).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("检查工人可用性失败: %w", err)
	}

	return count == 0, nil
}

func (s *DispatchService) AutoDispatch(orderID uint64) (*WorkerMatch, error) {
	lockKey := fmt.Sprintf("dispatch:lock:%d", orderID)
	locked, err := database.RedisClient.SetNX(database.Ctx, lockKey, "1", 30*time.Second).Result()
	if err != nil {
		return nil, fmt.Errorf("获取调度锁失败: %w", err)
	}
	if !locked {
		return nil, fmt.Errorf("订单正在调度中，请稍后再试")
	}
	defer database.RedisClient.Del(database.Ctx, lockKey)

	tx, err := s.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("创建事务失败: %w", err)
	}
	defer tx.Rollback()

	var status int
	checkQuery := `SELECT status FROM orders WHERE id = ? FOR UPDATE`
	err = tx.QueryRow(checkQuery, orderID).Scan(&status)
	if err != nil {
		return nil, fmt.Errorf("检查订单状态失败: %w", err)
	}
	if status != 0 {
		return nil, fmt.Errorf("订单状态不是待接单")
	}

	worker, err := s.GetBestWorker(orderID)
	if err != nil {
		return nil, err
	}

	updateQuery := `UPDATE orders SET worker_id = ?, status = 1, dispatch_type = 1, 
	                accepted_at = NOW() WHERE id = ?`
	_, err = tx.Exec(updateQuery, worker.ID, orderID)
	if err != nil {
		return nil, fmt.Errorf("更新订单失败: %w", err)
	}

	logQuery := `INSERT INTO order_status_logs (order_id, old_status, new_status, 
	             operator_id, operator_type, remark) VALUES (?, 0, 1, 0, 3, '系统自动派单')`
	_, err = tx.Exec(logQuery, orderID)
	if err != nil {
		return nil, fmt.Errorf("插入状态日志失败: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("提交事务失败: %w", err)
	}

	order, _ := s.getOrderInfo(orderID)
	s.publishOrderEvent("dispatched", order, worker)

	return worker, nil
}

func (s *DispatchService) getOrderInfo(orderID uint64) (*OrderInfo, error) {
	query := `SELECT o.id, o.order_no, o.user_id, o.service_id, s.category_id, 
	          a.city, o.appointment_date, o.appointment_time, o.status
	          FROM orders o
	          INNER JOIN services s ON o.service_id = s.id
	          INNER JOIN addresses a ON o.address_id = a.id
	          WHERE o.id = ?`

	order := &OrderInfo{}
	err := s.db.QueryRow(query, orderID).Scan(&order.ID, &order.OrderNo, &order.UserID,
		&order.ServiceID, &order.CategoryID, &order.City, &order.AppointmentDate,
		&order.AppointmentTime, &order.Status)
	if err != nil {
		return nil, err
	}
	return order, nil
}

func (s *DispatchService) calculateWorkerScore(worker *WorkerMatch) float64 {
	ratingScore := worker.Rating * 40
	orderCountScore := float64(worker.OrderCount) * 0.1
	certifiedScore := float64(worker.IsCertified) * 10
	levelScore := float64(worker.Level) * 5
	return ratingScore + orderCountScore + certifiedScore + levelScore - worker.Distance
}

func (s *DispatchService) publishOrderEvent(eventType string, order *OrderInfo, worker *WorkerMatch) {
	eventData := map[string]interface{}{
		"type":      eventType,
		"order_id":  order.ID,
		"order_no":  order.OrderNo,
		"worker_id": worker.ID,
		"timestamp": time.Now().Unix(),
	}
	eventJSON, _ := json.Marshal(eventData)
	database.RedisClient.Publish(database.Ctx, "order:events", eventJSON)
}

func (s *DispatchService) AcquireDispatchLock(orderID uint64) (bool, error) {
	lockKey := fmt.Sprintf("dispatch:lock:%d", orderID)
	return database.RedisClient.SetNX(database.Ctx, lockKey, "1", 30*time.Second).Result()
}

func (s *DispatchService) ReleaseDispatchLock(orderID uint64) error {
	lockKey := fmt.Sprintf("dispatch:lock:%d", orderID)
	return database.RedisClient.Del(database.Ctx, lockKey).Err()
}

func (s *DispatchService) ClearWorkerCache(city string, categoryID uint64) {
	cacheKey := fmt.Sprintf("workers:available:%s:%d", city, categoryID)
	database.RedisClient.Del(database.Ctx, cacheKey)
}

func (s *DispatchService) GrabOrder(orderID, workerID uint64, bidPrice float64) (float64, error) {
	lockKey := fmt.Sprintf("order:grab:%d", orderID)
	locked, err := database.RedisClient.SetNX(database.Ctx, lockKey, "1", 10*time.Second).Result()
	if err != nil {
		return 0, fmt.Errorf("获取抢单锁失败: %w", err)
	}
	if !locked {
		return 0, fmt.Errorf("订单正在被抢，请稍后再试")
	}
	defer database.RedisClient.Del(database.Ctx, lockKey)

	tx, err := s.db.Begin()
	if err != nil {
		return 0, fmt.Errorf("创建事务失败: %w", err)
	}
	defer tx.Rollback()

	var orderStatus int
	var categoryID uint64
	var city string
	var appointmentDate string
	var appointmentTime string
	var servicePrice float64

	orderQuery := `SELECT o.status, s.category_id, a.city, o.appointment_date, o.appointment_time, o.service_price
	               FROM orders o
	               INNER JOIN services s ON o.service_id = s.id
	               INNER JOIN addresses a ON o.address_id = a.id
	               WHERE o.id = ? FOR UPDATE`
	err = tx.QueryRow(orderQuery, orderID).Scan(&orderStatus, &categoryID, &city,
		&appointmentDate, &appointmentTime, &servicePrice)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("订单不存在")
		}
		return 0, fmt.Errorf("获取订单信息失败: %w", err)
	}

	if orderStatus != OrderStatusPending {
		return 0, fmt.Errorf("订单状态不是待接单，无法抢单")
	}

	var skillCount int
	skillQuery := `SELECT COUNT(*) FROM worker_skills WHERE worker_id = ? AND category_id = ?`
	err = tx.QueryRow(skillQuery, workerID, categoryID).Scan(&skillCount)
	if err != nil {
		return 0, fmt.Errorf("检查师傅技能失败: %w", err)
	}
	if skillCount == 0 {
		return 0, fmt.Errorf("您不具备该服务类别的技能，无法抢单")
	}

	var workerCity string
	workerQuery := `SELECT city FROM workers WHERE id = ?`
	err = tx.QueryRow(workerQuery, workerID).Scan(&workerCity)
	if err != nil {
		return 0, fmt.Errorf("获取师傅城市失败: %w", err)
	}
	if workerCity != city {
		return 0, fmt.Errorf("您不在该订单的服务城市，无法抢单")
	}

	available, err := s.CheckWorkerAvailability(workerID, appointmentDate, appointmentTime)
	if err != nil {
		return 0, fmt.Errorf("检查师傅时间可用性失败: %w", err)
	}
	if !available {
		return 0, fmt.Errorf("您在该时段已有订单，无法抢单")
	}

	var existingBid int
	bidCheckQuery := `SELECT COUNT(*) FROM order_bids WHERE order_id = ? AND worker_id = ?`
	err = tx.QueryRow(bidCheckQuery, orderID, workerID).Scan(&existingBid)
	if err != nil {
		return 0, fmt.Errorf("检查抢单状态失败: %w", err)
	}
	if existingBid > 0 {
		return 0, fmt.Errorf("您已对该订单发起抢单，请勿重复抢单")
	}

	finalPrice := bidPrice
	if finalPrice <= 0 {
		finalPrice = servicePrice
	}

	insertBidQuery := `INSERT INTO order_bids (order_id, worker_id, bid_price, is_winner) 
	                   VALUES (?, ?, ?, 0)`
	_, err = tx.Exec(insertBidQuery, orderID, workerID, finalPrice)
	if err != nil {
		return 0, fmt.Errorf("提交抢单失败: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return 0, fmt.Errorf("提交事务失败: %w", err)
	}

	s.publishGrabEvent(orderID, workerID, finalPrice)

	return finalPrice, nil
}

func (s *DispatchService) publishGrabEvent(orderID, workerID uint64, bidPrice float64) {
	eventData := map[string]interface{}{
		"type":       "grab_placed",
		"order_id":   orderID,
		"worker_id":  workerID,
		"bid_price":  bidPrice,
		"timestamp":  time.Now().Unix(),
	}
	eventJSON, _ := json.Marshal(eventData)
	database.RedisClient.Publish(database.Ctx, "order:events", eventJSON)
}
