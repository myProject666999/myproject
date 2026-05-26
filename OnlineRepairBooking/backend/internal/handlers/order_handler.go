package handlers

import (
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"fmt"
	"math/big"
	"strconv"
	"time"

	"online-repair-booking/internal/middleware"
	"online-repair-booking/internal/services"
	"online-repair-booking/pkg/database"
	"online-repair-booking/pkg/response"

	"github.com/labstack/echo/v4"
)

type OrderHandler struct {
	stateMachine    *services.OrderStateMachine
	dispatchService *services.DispatchService
}

func NewOrderHandler(db *sql.DB) *OrderHandler {
	return &OrderHandler{
		stateMachine:    services.NewOrderStateMachine(db),
		dispatchService: services.NewDispatchService(db),
	}
}

type CreateOrderRequest struct {
	ServiceID       uint64 `json:"service_id"`
	AddressID       uint64 `json:"address_id"`
	AppointmentDate string `json:"appointment_date"`
	AppointmentTime string `json:"appointment_time"`
	Quantity        int    `json:"quantity"`
	Remark          string `json:"remark"`
}

func (h *OrderHandler) CreateOrder(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "请先登录")
	}

	var req CreateOrderRequest
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	if req.ServiceID == 0 {
		return response.BadRequest(c, "服务ID不能为空")
	}
	if req.AddressID == 0 {
		return response.BadRequest(c, "地址ID不能为空")
	}
	if req.AppointmentDate == "" {
		return response.BadRequest(c, "预约日期不能为空")
	}
	if req.AppointmentTime == "" {
		return response.BadRequest(c, "预约时段不能为空")
	}
	if req.Quantity <= 0 {
		req.Quantity = 1
	}

	tx, err := database.MySQL.Begin()
	if err != nil {
		return response.InternalServerError(c, "创建事务失败")
	}
	defer tx.Rollback()

	var serviceName string
	var servicePrice float64
	serviceQuery := `SELECT name, price FROM services WHERE id = ? AND status = 1`
	err = tx.QueryRow(serviceQuery, req.ServiceID).Scan(&serviceName, &servicePrice)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "服务不存在或已下架")
		}
		return response.InternalServerError(c, "获取服务信息失败")
	}

	var addressName, addressPhone, addressProvince, addressCity, addressDistrict, addressDetail string
	addressQuery := `SELECT name, phone, province, city, district, detail FROM addresses WHERE id = ? AND user_id = ?`
	err = tx.QueryRow(addressQuery, req.AddressID, userID).Scan(&addressName, &addressPhone, &addressProvince, &addressCity, &addressDistrict, &addressDetail)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "地址不存在")
		}
		return response.InternalServerError(c, "获取地址信息失败")
	}

	addressSnapshot := map[string]interface{}{
		"name":     addressName,
		"phone":    addressPhone,
		"province": addressProvince,
		"city":     addressCity,
		"district": addressDistrict,
		"detail":   addressDetail,
	}
	addressJSON, _ := json.Marshal(addressSnapshot)

	orderNo := generateOrderNo()

	totalAmount := servicePrice * float64(req.Quantity)
	discountAmount := 0.00
	payAmount := totalAmount - discountAmount

	insertOrderQuery := `INSERT INTO orders (order_no, user_id, service_id, address_id, address_snapshot, 
		service_name, service_price, quantity, total_amount, discount_amount, pay_amount,
		appointment_date, appointment_time, remark, status, dispatch_type) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`
	result, err := tx.Exec(insertOrderQuery, orderNo, userID, req.ServiceID, req.AddressID, string(addressJSON),
		serviceName, servicePrice, req.Quantity, totalAmount, discountAmount, payAmount,
		req.AppointmentDate, req.AppointmentTime, req.Remark)
	if err != nil {
		return response.InternalServerError(c, "创建订单失败")
	}

	orderID, _ := result.LastInsertId()

	logQuery := `INSERT INTO order_status_logs (order_id, old_status, new_status, operator_id, operator_type, remark) 
		VALUES (?, -1, 0, ?, 1, '用户创建订单')`
	_, err = tx.Exec(logQuery, orderID, userID)
	if err != nil {
		return response.InternalServerError(c, "记录状态日志失败")
	}

	if err := tx.Commit(); err != nil {
		return response.InternalServerError(c, "提交事务失败")
	}

	state := &services.OrderState{
		ID:        uint64(orderID),
		OrderNo:   orderNo,
		Status:    services.OrderStatusPending,
		WorkerID:  0,
		UpdatedAt: time.Now().Format("2006-01-02 15:04:05"),
	}
	cacheOrderState(state)

	return response.SuccessWithMessage(c, "订单创建成功", map[string]interface{}{
		"order_id":     orderID,
		"order_no":     orderNo,
		"total_amount": totalAmount,
		"pay_amount":   payAmount,
	})
}

func (h *OrderHandler) GetOrderList(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "请先登录")
	}

	pageStr := c.QueryParam("page")
	pageSizeStr := c.QueryParam("page_size")
	statusStr := c.QueryParam("status")

	page := 1
	if pageStr != "" {
		page, _ = strconv.Atoi(pageStr)
	}
	if page < 1 {
		page = 1
	}

	pageSize := 10
	if pageSizeStr != "" {
		pageSize, _ = strconv.Atoi(pageSizeStr)
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	status := -1
	if statusStr != "" {
		s, err := strconv.Atoi(statusStr)
		if err == nil {
			status = s
		}
	}

	var total int64
	countQuery := `SELECT COUNT(*) FROM orders WHERE user_id = ?`
	countArgs := []interface{}{userID}
	if status >= 0 {
		countQuery += ` AND status = ?`
		countArgs = append(countArgs, status)
	}
	err := database.MySQL.QueryRow(countQuery, countArgs...).Scan(&total)
	if err != nil {
		return response.InternalServerError(c, "获取订单总数失败")
	}

	offset := (page - 1) * pageSize
	query := `SELECT o.id, o.order_no, o.service_id, o.service_name, o.service_price, o.quantity,
		o.total_amount, o.pay_amount, o.appointment_date, o.appointment_time, o.remark,
		o.status, o.worker_id, o.accepted_at, o.started_at, o.completed_at, o.cancelled_at,
		o.created_at, w.real_name, w.avatar
		FROM orders o
		LEFT JOIN workers w ON o.worker_id = w.id
		WHERE o.user_id = ?`
	args := []interface{}{userID}
	if status >= 0 {
		query += ` AND o.status = ?`
		args = append(args, status)
	}
	query += ` ORDER BY o.id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.MySQL.Query(query, args...)
	if err != nil {
		return response.InternalServerError(c, "获取订单列表失败")
	}
	defer rows.Close()

	type OrderItem struct {
		ID              uint64  `json:"id"`
		OrderNo         string  `json:"order_no"`
		ServiceID       uint64  `json:"service_id"`
		ServiceName     string  `json:"service_name"`
		ServicePrice    float64 `json:"service_price"`
		Quantity        int     `json:"quantity"`
		TotalAmount     float64 `json:"total_amount"`
		PayAmount       float64 `json:"pay_amount"`
		AppointmentDate string  `json:"appointment_date"`
		AppointmentTime string  `json:"appointment_time"`
		Remark          string  `json:"remark"`
		Status          int     `json:"status"`
		StatusName      string  `json:"status_name"`
		WorkerID        uint64  `json:"worker_id"`
		WorkerName      string  `json:"worker_name"`
		WorkerAvatar    string  `json:"worker_avatar"`
		CreatedAt       string  `json:"created_at"`
	}

	orders := make([]*OrderItem, 0)
	for rows.Next() {
		order := &OrderItem{}
		var acceptedAt, startedAt, completedAt, cancelledAt sql.NullTime
		var workerID sql.NullInt64
		var workerName, workerAvatar sql.NullString
		var createdAt time.Time

		err := rows.Scan(&order.ID, &order.OrderNo, &order.ServiceID, &order.ServiceName, &order.ServicePrice,
			&order.Quantity, &order.TotalAmount, &order.PayAmount, &order.AppointmentDate, &order.AppointmentTime,
			&order.Remark, &order.Status, &workerID, &acceptedAt, &startedAt, &completedAt, &cancelledAt,
			&createdAt, &workerName, &workerAvatar)
		if err != nil {
			return response.InternalServerError(c, "解析订单数据失败")
		}

		if workerID.Valid {
			order.WorkerID = uint64(workerID.Int64)
		}
		order.WorkerName = workerName.String
		order.WorkerAvatar = workerAvatar.String
		order.StatusName = services.GetStatusName(order.Status)
		order.CreatedAt = createdAt.Format("2006-01-02 15:04:05")

		orders = append(orders, order)
	}

	result := &PaginationResult{
		List:     orders,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}

	return response.Success(c, result)
}

func (h *OrderHandler) GetOrderDetail(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "请先登录")
	}

	orderIDStr := c.Param("id")
	if orderIDStr == "" {
		return response.BadRequest(c, "订单ID不能为空")
	}

	orderID, err := strconv.ParseUint(orderIDStr, 10, 64)
	if err != nil {
		return response.BadRequest(c, "订单ID格式错误")
	}

	query := `SELECT o.id, o.order_no, o.user_id, o.service_id, o.address_id, o.address_snapshot,
		o.service_name, o.service_price, o.quantity, o.total_amount, o.discount_amount, o.pay_amount,
		o.appointment_date, o.appointment_time, o.remark, o.status, o.dispatch_type,
		o.paid_at, o.accepted_at, o.started_at, o.completed_at, o.cancelled_at, o.cancel_reason,
		o.created_at, o.updated_at,
		w.id, w.real_name, w.avatar, w.phone, w.rating
		FROM orders o
		LEFT JOIN workers w ON o.worker_id = w.id
		WHERE o.id = ?`

	row := database.MySQL.QueryRow(query, orderID)

	type OrderDetail struct {
		ID              uint64        `json:"id"`
		OrderNo         string        `json:"order_no"`
		UserID          uint64        `json:"user_id"`
		ServiceID       uint64        `json:"service_id"`
		AddressID       uint64        `json:"address_id"`
		AddressSnapshot string        `json:"address_snapshot"`
		ServiceName     string        `json:"service_name"`
		ServicePrice    float64       `json:"service_price"`
		Quantity        int           `json:"quantity"`
		TotalAmount     float64       `json:"total_amount"`
		DiscountAmount  float64       `json:"discount_amount"`
		PayAmount       float64       `json:"pay_amount"`
		AppointmentDate string        `json:"appointment_date"`
		AppointmentTime string        `json:"appointment_time"`
		Remark          string        `json:"remark"`
		Status          int           `json:"status"`
		StatusName      string        `json:"status_name"`
		DispatchType    int           `json:"dispatch_type"`
		CancelReason    string        `json:"cancel_reason,omitempty"`
		CreatedAt       string        `json:"created_at"`
		UpdatedAt       string        `json:"updated_at"`
		WorkerID        uint64        `json:"worker_id,omitempty"`
		WorkerName      string        `json:"worker_name,omitempty"`
		WorkerAvatar    string        `json:"worker_avatar,omitempty"`
		WorkerPhone     string        `json:"worker_phone,omitempty"`
		WorkerRating    float64       `json:"worker_rating,omitempty"`
		StatusLogs      []interface{} `json:"status_logs,omitempty"`
	}

	order := &OrderDetail{}
	var workerID sql.NullInt64
	var workerName, workerAvatar, workerPhone sql.NullString
	var workerRating sql.NullFloat64
	var paidAt, acceptedAt, startedAt, completedAt, cancelledAt sql.NullTime
	var createdAt, updatedAt time.Time

	err = row.Scan(&order.ID, &order.OrderNo, &order.UserID, &order.ServiceID, &order.AddressID, &order.AddressSnapshot,
		&order.ServiceName, &order.ServicePrice, &order.Quantity, &order.TotalAmount, &order.DiscountAmount, &order.PayAmount,
		&order.AppointmentDate, &order.AppointmentTime, &order.Remark, &order.Status, &order.DispatchType,
		&paidAt, &acceptedAt, &startedAt, &completedAt, &cancelledAt, &order.CancelReason,
		&createdAt, &updatedAt, &workerID, &workerName, &workerAvatar, &workerPhone, &workerRating)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "订单不存在")
		}
		return response.InternalServerError(c, "获取订单详情失败")
	}

	if order.UserID != userID && workerID.Int64 != int64(middleware.GetUserID(c)) {
		return response.Forbidden(c, "您无权查看该订单")
	}

	if workerID.Valid {
		order.WorkerID = uint64(workerID.Int64)
		order.WorkerName = workerName.String
		order.WorkerAvatar = workerAvatar.String
		order.WorkerPhone = workerPhone.String
		order.WorkerRating = workerRating.Float64
	}
	order.StatusName = services.GetStatusName(order.Status)
	order.CreatedAt = createdAt.Format("2006-01-02 15:04:05")
	order.UpdatedAt = updatedAt.Format("2006-01-02 15:04:05")

	logQuery := `SELECT id, old_status, new_status, operator_id, operator_type, remark, created_at 
		FROM order_status_logs WHERE order_id = ? ORDER BY id DESC`
	logRows, err := database.MySQL.Query(logQuery, orderID)
	if err == nil {
		defer logRows.Close()
		type StatusLog struct {
			ID            uint64 `json:"id"`
			OldStatus     int    `json:"old_status"`
			NewStatus     int    `json:"new_status"`
			OldStatusName string `json:"old_status_name"`
			NewStatusName string `json:"new_status_name"`
			OperatorID    uint64 `json:"operator_id"`
			OperatorType  int    `json:"operator_type"`
			Remark        string `json:"remark"`
			CreatedAt     string `json:"created_at"`
		}

		logs := make([]interface{}, 0)
		for logRows.Next() {
			log := &StatusLog{}
			var logCreatedAt time.Time
			logRows.Scan(&log.ID, &log.OldStatus, &log.NewStatus, &log.OperatorID, &log.OperatorType, &log.Remark, &logCreatedAt)
			log.OldStatusName = services.GetStatusName(log.OldStatus)
			log.NewStatusName = services.GetStatusName(log.NewStatus)
			log.CreatedAt = logCreatedAt.Format("2006-01-02 15:04:05")
			logs = append(logs, log)
		}
		order.StatusLogs = logs
	}

	return response.Success(c, order)
}

func (h *OrderHandler) CancelOrder(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "请先登录")
	}

	orderIDStr := c.Param("id")
	if orderIDStr == "" {
		return response.BadRequest(c, "订单ID不能为空")
	}

	orderID, err := strconv.ParseUint(orderIDStr, 10, 64)
	if err != nil {
		return response.BadRequest(c, "订单ID格式错误")
	}

	var req struct {
		CancelReason string `json:"cancel_reason"`
	}
	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	var orderUserID uint64
	var orderStatus int
	query := `SELECT user_id, status FROM orders WHERE id = ?`
	err = database.MySQL.QueryRow(query, orderID).Scan(&orderUserID, &orderStatus)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "订单不存在")
		}
		return response.InternalServerError(c, "获取订单信息失败")
	}

	if orderUserID != userID {
		return response.Forbidden(c, "您无权取消该订单")
	}

	if orderStatus == services.OrderStatusCompleted || orderStatus == services.OrderStatusCancelled {
		return response.BadRequest(c, services.GetTransitionErrorMsg(orderStatus, services.OrderStatusCancelled))
	}

	remark := req.CancelReason
	if remark == "" {
		remark = "用户取消订单"
	}

	err = h.stateMachine.TransitionOrder(int64(orderID), services.OrderStatusCancelled, int64(userID), services.OperatorTypeUser, remark)
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.SuccessWithMessage(c, "订单取消成功", nil)
}

func (h *OrderHandler) WorkerGetOrderList(c echo.Context) error {
	workerID, err := h.getWorkerIDFromContext(c)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	pageStr := c.QueryParam("page")
	pageSizeStr := c.QueryParam("page_size")
	statusStr := c.QueryParam("status")

	page := 1
	if pageStr != "" {
		page, _ = strconv.Atoi(pageStr)
	}
	if page < 1 {
		page = 1
	}

	pageSize := 10
	if pageSizeStr != "" {
		pageSize, _ = strconv.Atoi(pageSizeStr)
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	status := -1
	if statusStr != "" {
		s, err := strconv.Atoi(statusStr)
		if err == nil {
			status = s
		}
	}

	var total int64
	countQuery := `SELECT COUNT(*) FROM orders WHERE worker_id = ?`
	countArgs := []interface{}{workerID}
	if status >= 0 {
		countQuery += ` AND status = ?`
		countArgs = append(countArgs, status)
	}
	err = database.MySQL.QueryRow(countQuery, countArgs...).Scan(&total)
	if err != nil {
		return response.InternalServerError(c, "获取订单总数失败")
	}

	offset := (page - 1) * pageSize
	query := `SELECT o.id, o.order_no, o.service_id, o.service_name, o.service_price, o.quantity,
		o.total_amount, o.pay_amount, o.appointment_date, o.appointment_time, o.remark,
		o.status, o.user_id, o.accepted_at, o.started_at, o.completed_at,
		o.created_at, u.username, u.avatar, u.phone
		FROM orders o
		INNER JOIN users u ON o.user_id = u.id
		WHERE o.worker_id = ?`
	args := []interface{}{workerID}
	if status >= 0 {
		query += ` AND o.status = ?`
		args = append(args, status)
	}
	query += ` ORDER BY o.id DESC LIMIT ? OFFSET ?`
	args = append(args, pageSize, offset)

	rows, err := database.MySQL.Query(query, args...)
	if err != nil {
		return response.InternalServerError(c, "获取订单列表失败")
	}
	defer rows.Close()

	type WorkerOrderItem struct {
		ID              uint64  `json:"id"`
		OrderNo         string  `json:"order_no"`
		ServiceID       uint64  `json:"service_id"`
		ServiceName     string  `json:"service_name"`
		ServicePrice    float64 `json:"service_price"`
		Quantity        int     `json:"quantity"`
		TotalAmount     float64 `json:"total_amount"`
		PayAmount       float64 `json:"pay_amount"`
		AppointmentDate string  `json:"appointment_date"`
		AppointmentTime string  `json:"appointment_time"`
		Remark          string  `json:"remark"`
		Status          int     `json:"status"`
		StatusName      string  `json:"status_name"`
		UserID          uint64  `json:"user_id"`
		UserName        string  `json:"user_name"`
		UserAvatar      string  `json:"user_avatar"`
		UserPhone       string  `json:"user_phone"`
		CreatedAt       string  `json:"created_at"`
	}

	orders := make([]*WorkerOrderItem, 0)
	for rows.Next() {
		order := &WorkerOrderItem{}
		var acceptedAt, startedAt, completedAt sql.NullTime
		var createdAt time.Time

		err := rows.Scan(&order.ID, &order.OrderNo, &order.ServiceID, &order.ServiceName, &order.ServicePrice,
			&order.Quantity, &order.TotalAmount, &order.PayAmount, &order.AppointmentDate, &order.AppointmentTime,
			&order.Remark, &order.Status, &order.UserID, &acceptedAt, &startedAt, &completedAt,
			&createdAt, &order.UserName, &order.UserAvatar, &order.UserPhone)
		if err != nil {
			return response.InternalServerError(c, "解析订单数据失败")
		}

		order.StatusName = services.GetStatusName(order.Status)
		order.CreatedAt = createdAt.Format("2006-01-02 15:04:05")

		orders = append(orders, order)
	}

	result := &PaginationResult{
		List:     orders,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}

	return response.Success(c, result)
}

func (h *OrderHandler) WorkerAcceptOrder(c echo.Context) error {
	workerID, err := h.getWorkerIDFromContext(c)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	orderIDStr := c.Param("id")
	if orderIDStr == "" {
		return response.BadRequest(c, "订单ID不能为空")
	}

	orderID, err := strconv.ParseUint(orderIDStr, 10, 64)
	if err != nil {
		return response.BadRequest(c, "订单ID格式错误")
	}

	var orderStatus int
	var orderWorkerID sql.NullInt64
	query := `SELECT status, worker_id FROM orders WHERE id = ?`
	err = database.MySQL.QueryRow(query, orderID).Scan(&orderStatus, &orderWorkerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "订单不存在")
		}
		return response.InternalServerError(c, "获取订单信息失败")
	}

	if orderStatus != services.OrderStatusPending {
		return response.BadRequest(c, services.GetTransitionErrorMsg(orderStatus, services.OrderStatusAccepted))
	}

	if !orderWorkerID.Valid || uint64(orderWorkerID.Int64) != workerID {
		return response.Forbidden(c, "您不是该订单的指定师傅，无法接单")
	}

	tx, err := database.MySQL.Begin()
	if err != nil {
		return response.InternalServerError(c, "创建事务失败")
	}
	defer tx.Rollback()

	updateOrderQuery := `UPDATE orders SET status = 1, accepted_at = NOW() WHERE id = ?`
	_, err = tx.Exec(updateOrderQuery, orderID)
	if err != nil {
		return response.InternalServerError(c, "更新订单状态失败")
	}

	logQuery := `INSERT INTO order_status_logs (order_id, old_status, new_status, operator_id, operator_type, remark) 
		VALUES (?, 0, 1, ?, 2, '师傅接单')`
	_, err = tx.Exec(logQuery, orderID, workerID)
	if err != nil {
		return response.InternalServerError(c, "记录状态日志失败")
	}

	if err := tx.Commit(); err != nil {
		return response.InternalServerError(c, "提交事务失败")
	}

	state := &services.OrderState{
		ID:        orderID,
		Status:    services.OrderStatusAccepted,
		WorkerID:  workerID,
		UpdatedAt: time.Now().Format("2006-01-02 15:04:05"),
	}
	cacheOrderState(state)

	return response.SuccessWithMessage(c, "接单成功", nil)
}

func (h *OrderHandler) WorkerStartService(c echo.Context) error {
	workerID, err := h.getWorkerIDFromContext(c)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	orderIDStr := c.Param("id")
	if orderIDStr == "" {
		return response.BadRequest(c, "订单ID不能为空")
	}

	orderID, err := strconv.ParseUint(orderIDStr, 10, 64)
	if err != nil {
		return response.BadRequest(c, "订单ID格式错误")
	}

	var orderStatus int
	var orderWorkerID sql.NullInt64
	query := `SELECT status, worker_id FROM orders WHERE id = ?`
	err = database.MySQL.QueryRow(query, orderID).Scan(&orderStatus, &orderWorkerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "订单不存在")
		}
		return response.InternalServerError(c, "获取订单信息失败")
	}

	if orderStatus != services.OrderStatusAccepted {
		return response.BadRequest(c, services.GetTransitionErrorMsg(orderStatus, services.OrderStatusInService))
	}

	if !orderWorkerID.Valid || uint64(orderWorkerID.Int64) != workerID {
		return response.Forbidden(c, "您不是该订单的师傅，无法操作")
	}

	err = h.stateMachine.TransitionOrder(int64(orderID), services.OrderStatusInService, int64(workerID), services.OperatorTypeWorker, "师傅开始服务")
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.SuccessWithMessage(c, "服务已开始", nil)
}

func (h *OrderHandler) WorkerCompleteService(c echo.Context) error {
	workerID, err := h.getWorkerIDFromContext(c)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	orderIDStr := c.Param("id")
	if orderIDStr == "" {
		return response.BadRequest(c, "订单ID不能为空")
	}

	orderID, err := strconv.ParseUint(orderIDStr, 10, 64)
	if err != nil {
		return response.BadRequest(c, "订单ID格式错误")
	}

	var orderStatus int
	var orderWorkerID sql.NullInt64
	query := `SELECT status, worker_id FROM orders WHERE id = ?`
	err = database.MySQL.QueryRow(query, orderID).Scan(&orderStatus, &orderWorkerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "订单不存在")
		}
		return response.InternalServerError(c, "获取订单信息失败")
	}

	if orderStatus != services.OrderStatusInService {
		return response.BadRequest(c, services.GetTransitionErrorMsg(orderStatus, services.OrderStatusToReview))
	}

	if !orderWorkerID.Valid || uint64(orderWorkerID.Int64) != workerID {
		return response.Forbidden(c, "您不是该订单的师傅，无法操作")
	}

	err = h.stateMachine.TransitionOrder(int64(orderID), services.OrderStatusToReview, int64(workerID), services.OperatorTypeWorker, "师傅完成服务")
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.SuccessWithMessage(c, "服务已完成，等待用户评价", nil)
}

func (h *OrderHandler) GetPendingOrders(c echo.Context) error {
	workerID, err := h.getWorkerIDFromContext(c)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	pageStr := c.QueryParam("page")
	pageSizeStr := c.QueryParam("page_size")

	page := 1
	if pageStr != "" {
		page, _ = strconv.Atoi(pageStr)
	}
	if page < 1 {
		page = 1
	}

	pageSize := 10
	if pageSizeStr != "" {
		pageSize, _ = strconv.Atoi(pageSizeStr)
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	var city string
	var categoryIDs []uint64

	workerQuery := `SELECT city FROM workers WHERE id = ?`
	err = database.MySQL.QueryRow(workerQuery, workerID).Scan(&city)
	if err != nil {
		return response.InternalServerError(c, "获取师傅信息失败")
	}

	categoryQuery := `SELECT category_id FROM worker_skills WHERE worker_id = ?`
	categoryRows, err := database.MySQL.Query(categoryQuery, workerID)
	if err != nil {
		return response.InternalServerError(c, "获取师傅技能失败")
	}
	defer categoryRows.Close()

	for categoryRows.Next() {
		var categoryID uint64
		if err := categoryRows.Scan(&categoryID); err == nil {
			categoryIDs = append(categoryIDs, categoryID)
		}
	}

	if len(categoryIDs) == 0 {
		return response.Success(c, &PaginationResult{
			List:     []interface{}{},
			Total:    0,
			Page:     page,
			PageSize: pageSize,
		})
	}

	placeholders := make([]string, len(categoryIDs))
	args := make([]interface{}, 0)
	for i := range categoryIDs {
		placeholders[i] = "?"
		args = append(args, categoryIDs[i])
	}
	args = append(args, city)

	countQuery := `SELECT COUNT(DISTINCT o.id) FROM orders o
	               INNER JOIN services s ON o.service_id = s.id
	               INNER JOIN addresses a ON o.address_id = a.id
	               WHERE o.status = 0 AND s.category_id IN (` + fmt.Sprintf("%s", placeholders[0])
	for i := 1; i < len(placeholders); i++ {
		countQuery += "," + placeholders[i]
	}
	countQuery += `) AND a.city = ?`

	var total int64
	err = database.MySQL.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return response.InternalServerError(c, "获取订单总数失败")
	}

	offset := (page - 1) * pageSize
	query := `SELECT DISTINCT o.id, o.order_no, o.user_id, o.service_id, o.service_name, 
	          o.service_price, o.total_amount, o.appointment_date, o.appointment_time,
	          o.remark, o.created_at, s.category_id, a.city, a.district, a.detail,
	          u.username, u.avatar
	          FROM orders o
	          INNER JOIN services s ON o.service_id = s.id
	          INNER JOIN addresses a ON o.address_id = a.id
	          INNER JOIN users u ON o.user_id = u.id
	          WHERE o.status = 0 AND s.category_id IN (` + fmt.Sprintf("%s", placeholders[0])
	for i := 1; i < len(placeholders); i++ {
		query += "," + placeholders[i]
	}
	query += `) AND a.city = ? ORDER BY o.created_at DESC LIMIT ? OFFSET ?`

	args = append(args, pageSize, offset)

	rows, err := database.MySQL.Query(query, args...)
	if err != nil {
		return response.InternalServerError(c, "获取订单列表失败")
	}
	defer rows.Close()

	type PendingOrder struct {
		ID              uint64  `json:"id"`
		OrderNo         string  `json:"order_no"`
		UserID          uint64  `json:"user_id"`
		ServiceID       uint64  `json:"service_id"`
		CategoryID      uint64  `json:"category_id"`
		ServiceName     string  `json:"service_name"`
		ServicePrice    float64 `json:"service_price"`
		TotalAmount     float64 `json:"total_amount"`
		AppointmentDate string  `json:"appointment_date"`
		AppointmentTime string  `json:"appointment_time"`
		Remark          string  `json:"remark"`
		City            string  `json:"city"`
		District        string  `json:"district"`
		Detail          string  `json:"detail"`
		Username        string  `json:"username"`
		Avatar          string  `json:"avatar"`
		CreatedAt       string  `json:"created_at"`
		HasBid          bool    `json:"has_bid"`
	}

	orders := make([]*PendingOrder, 0)
	orderIDs := make([]uint64, 0)
	for rows.Next() {
		order := &PendingOrder{}
		var createdAt time.Time
		err := rows.Scan(&order.ID, &order.OrderNo, &order.UserID, &order.ServiceID,
			&order.ServiceName, &order.ServicePrice, &order.TotalAmount,
			&order.AppointmentDate, &order.AppointmentTime, &order.Remark,
			&createdAt, &order.CategoryID, &order.City, &order.District,
			&order.Detail, &order.Username, &order.Avatar)
		if err != nil {
			return response.InternalServerError(c, "解析订单数据失败")
		}
		order.CreatedAt = createdAt.Format("2006-01-02 15:04:05")
		orders = append(orders, order)
		orderIDs = append(orderIDs, order.ID)
	}

	if len(orderIDs) > 0 {
		bidPlaceholders := make([]string, len(orderIDs))
		bidArgs := make([]interface{}, 0)
		bidArgs = append(bidArgs, workerID)
		for i, id := range orderIDs {
			bidPlaceholders[i] = "?"
			bidArgs = append(bidArgs, id)
		}
		bidQuery := `SELECT order_id FROM order_bids WHERE worker_id = ? AND order_id IN (`
		bidQuery += fmt.Sprintf("%s", bidPlaceholders[0])
		for i := 1; i < len(bidPlaceholders); i++ {
			bidQuery += "," + bidPlaceholders[i]
		}
		bidQuery += ")"
		bidRows, err := database.MySQL.Query(bidQuery, bidArgs...)
		if err == nil {
			defer bidRows.Close()
			bidOrders := make(map[uint64]bool)
			for bidRows.Next() {
				var oid uint64
				if err := bidRows.Scan(&oid); err == nil {
					bidOrders[oid] = true
				}
			}
			for _, order := range orders {
				order.HasBid = bidOrders[order.ID]
			}
		}
	}

	result := &PaginationResult{
		List:     orders,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}

	return response.Success(c, result)
}

func (h *OrderHandler) getWorkerIDFromContext(c echo.Context) (uint64, error) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return 0, fmt.Errorf("未登录")
	}

	userRole := middleware.GetUserRole(c)
	if userRole != 2 {
		return 0, fmt.Errorf("只有师傅可以访问")
	}

	var workerID uint64
	query := `SELECT id FROM workers WHERE user_id = ?`
	err := database.MySQL.QueryRow(query, userID).Scan(&workerID)
	if err != nil {
		return 0, fmt.Errorf("获取师傅信息失败")
	}

	return workerID, nil
}

func generateOrderNo() string {
	timestamp := time.Now().Format("20060102150405")
	n, _ := rand.Int(rand.Reader, big.NewInt(1000000))
	random := fmt.Sprintf("%06d", n.Int64())
	return timestamp + random
}

func cacheOrderState(state *services.OrderState) {
	cacheKey := fmt.Sprintf("order:status:%d", state.ID)
	stateJSON, _ := json.Marshal(state)
	database.RedisClient.SetEx(database.Ctx, cacheKey, stateJSON, 30*time.Minute)
}
