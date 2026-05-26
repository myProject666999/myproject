package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"online-repair-booking/internal/middleware"
	"online-repair-booking/internal/services"
	"online-repair-booking/pkg/database"
	"online-repair-booking/pkg/response"

	"github.com/labstack/echo/v4"
)

type BidHandler struct {
	dispatchService *services.DispatchService
}

func NewBidHandler(db *sql.DB) *BidHandler {
	return &BidHandler{
		dispatchService: services.NewDispatchService(db),
	}
}

func (h *BidHandler) GetPendingOrders(c echo.Context) error {
	workerID, err := h.getWorkerIDFromContext(c)
	if err != nil {
		return response.Unauthorized(c, "请先登录")
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
			&order.CreatedAt, &order.CategoryID, &order.City, &order.District,
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

func (h *BidHandler) PlaceBid(c echo.Context) error {
	workerID, err := h.getWorkerIDFromContext(c)
	if err != nil {
		return response.Unauthorized(c, "请先登录")
	}

	var req struct {
		OrderID       uint64  `json:"order_id"`
		BidPrice      float64 `json:"bid_price"`
		Remark        string  `json:"remark"`
		EstimatedTime int     `json:"estimated_time"`
	}

	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	if req.OrderID == 0 {
		return response.BadRequest(c, "订单ID不能为空")
	}

	tx, err := database.MySQL.Begin()
	if err != nil {
		return response.InternalServerError(c, "创建事务失败")
	}
	defer tx.Rollback()

	var orderStatus int
	var categoryID uint64
	var city string
	var appointmentDate string
	var appointmentTime string

	orderQuery := `SELECT o.status, s.category_id, a.city, o.appointment_date, o.appointment_time
	               FROM orders o
	               INNER JOIN services s ON o.service_id = s.id
	               INNER JOIN addresses a ON o.address_id = a.id
	               WHERE o.id = ? FOR UPDATE`
	err = tx.QueryRow(orderQuery, req.OrderID).Scan(&orderStatus, &categoryID, &city,
		&appointmentDate, &appointmentTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "订单不存在")
		}
		return response.InternalServerError(c, "获取订单信息失败")
	}

	if orderStatus != 0 {
		return response.BadRequest(c, "订单状态不是待接单，无法抢单")
	}

	var skillCount int
	skillQuery := `SELECT COUNT(*) FROM worker_skills WHERE worker_id = ? AND category_id = ?`
	err = tx.QueryRow(skillQuery, workerID, categoryID).Scan(&skillCount)
	if err != nil {
		return response.InternalServerError(c, "检查师傅技能失败")
	}
	if skillCount == 0 {
		return response.BadRequest(c, "您不具备该服务类别的技能，无法抢单")
	}

	var workerCity string
	workerQuery := `SELECT city FROM workers WHERE id = ?`
	err = tx.QueryRow(workerQuery, workerID).Scan(&workerCity)
	if err != nil {
		return response.InternalServerError(c, "获取师傅城市失败")
	}
	if workerCity != city {
		return response.BadRequest(c, "您不在该订单的服务城市，无法抢单")
	}

	available, err := h.dispatchService.CheckWorkerAvailability(workerID, appointmentDate, appointmentTime)
	if err != nil {
		return response.InternalServerError(c, "检查师傅时间可用性失败")
	}
	if !available {
		return response.BadRequest(c, "您在该时段已有订单，无法抢单")
	}

	var existingBid int
	bidCheckQuery := `SELECT COUNT(*) FROM order_bids WHERE order_id = ? AND worker_id = ?`
	err = tx.QueryRow(bidCheckQuery, req.OrderID, workerID).Scan(&existingBid)
	if err != nil {
		return response.InternalServerError(c, "检查抢单状态失败")
	}
	if existingBid > 0 {
		return response.BadRequest(c, "您已对该订单发起抢单，请勿重复抢单")
	}

	bidPrice := req.BidPrice
	if bidPrice <= 0 {
		var orderPrice float64
		priceQuery := `SELECT service_price FROM orders WHERE id = ?`
		tx.QueryRow(priceQuery, req.OrderID).Scan(&orderPrice)
		bidPrice = orderPrice
	}

	insertBidQuery := `INSERT INTO order_bids (order_id, worker_id, bid_price, remark, is_winner) 
	                   VALUES (?, ?, ?, ?, 0)`
	_, err = tx.Exec(insertBidQuery, req.OrderID, workerID, bidPrice, req.Remark)
	if err != nil {
		return response.InternalServerError(c, "提交抢单失败")
	}

	if err := tx.Commit(); err != nil {
		return response.InternalServerError(c, "提交事务失败")
	}

	h.publishBidEvent("bid_placed", req.OrderID, workerID)

	return response.SuccessWithMessage(c, "抢单提交成功", map[string]interface{}{
		"order_id":  req.OrderID,
		"bid_price": bidPrice,
	})
}

func (h *BidHandler) GetOrderBids(c echo.Context) error {
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

	var orderUserID uint64
	orderQuery := `SELECT user_id FROM orders WHERE id = ?`
	err = database.MySQL.QueryRow(orderQuery, orderID).Scan(&orderUserID)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "订单不存在")
		}
		return response.InternalServerError(c, "获取订单信息失败")
	}

	if orderUserID != userID {
		return response.Forbidden(c, "您无权查看该订单的抢单信息")
	}

	query := `SELECT b.id, b.order_id, b.worker_id, b.bid_price, b.remark, 
	          b.is_winner, b.created_at,
	          w.real_name, w.avatar, w.rating, w.order_count, w.level, w.is_certified
	          FROM order_bids b
	          INNER JOIN workers w ON b.worker_id = w.id
	          WHERE b.order_id = ?
	          ORDER BY b.created_at DESC`

	rows, err := database.MySQL.Query(query, orderID)
	if err != nil {
		return response.InternalServerError(c, "获取抢单列表失败")
	}
	defer rows.Close()

	type BidItem struct {
		ID          uint64  `json:"id"`
		OrderID     uint64  `json:"order_id"`
		WorkerID    uint64  `json:"worker_id"`
		BidPrice    float64 `json:"bid_price"`
		Remark      string  `json:"remark"`
		IsWinner    int     `json:"is_winner"`
		CreatedAt   string  `json:"created_at"`
		RealName    string  `json:"real_name"`
		Avatar      string  `json:"avatar"`
		Rating      float64 `json:"rating"`
		OrderCount  int     `json:"order_count"`
		Level       int     `json:"level"`
		IsCertified int     `json:"is_certified"`
	}

	bids := make([]*BidItem, 0)
	for rows.Next() {
		bid := &BidItem{}
		var createdAt time.Time
		err := rows.Scan(&bid.ID, &bid.OrderID, &bid.WorkerID, &bid.BidPrice,
			&bid.Remark, &bid.IsWinner, &createdAt, &bid.RealName, &bid.Avatar,
			&bid.Rating, &bid.OrderCount, &bid.Level, &bid.IsCertified)
		if err != nil {
			return response.InternalServerError(c, "解析抢单数据失败")
		}
		bid.CreatedAt = createdAt.Format("2006-01-02 15:04:05")
		bids = append(bids, bid)
	}

	return response.Success(c, bids)
}

func (h *BidHandler) AcceptBid(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "请先登录")
	}

	var req struct {
		BidID   uint64 `json:"bid_id"`
		OrderID uint64 `json:"order_id"`
	}

	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	if req.BidID == 0 || req.OrderID == 0 {
		return response.BadRequest(c, "订单ID和抢单ID不能为空")
	}

	tx, err := database.MySQL.Begin()
	if err != nil {
		return response.InternalServerError(c, "创建事务失败")
	}
	defer tx.Rollback()

	var orderStatus int
	var orderUserID uint64
	orderQuery := `SELECT status, user_id FROM orders WHERE id = ? FOR UPDATE`
	err = tx.QueryRow(orderQuery, req.OrderID).Scan(&orderStatus, &orderUserID)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "订单不存在")
		}
		return response.InternalServerError(c, "获取订单信息失败")
	}

	if orderUserID != userID {
		return response.Forbidden(c, "您无权操作该订单")
	}

	if orderStatus != 0 {
		return response.BadRequest(c, "订单状态不是待接单，无法接受抢单")
	}

	var workerID uint64
	var bidPrice float64
	bidQuery := `SELECT worker_id, bid_price FROM order_bids WHERE id = ? AND order_id = ?`
	err = tx.QueryRow(bidQuery, req.BidID, req.OrderID).Scan(&workerID, &bidPrice)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "抢单记录不存在")
		}
		return response.InternalServerError(c, "获取抢单信息失败")
	}

	updateBidQuery := `UPDATE order_bids SET is_winner = 1 WHERE id = ?`
	_, err = tx.Exec(updateBidQuery, req.BidID)
	if err != nil {
		return response.InternalServerError(c, "更新抢单状态失败")
	}

	updateOtherBidsQuery := `UPDATE order_bids SET is_winner = 0 WHERE order_id = ? AND id != ?`
	_, err = tx.Exec(updateOtherBidsQuery, req.OrderID, req.BidID)
	if err != nil {
		return response.InternalServerError(c, "更新其他抢单状态失败")
	}

	updateOrderQuery := `UPDATE orders SET worker_id = ?, status = 1, dispatch_type = 0, 
	                     pay_amount = ?, accepted_at = NOW() WHERE id = ?`
	_, err = tx.Exec(updateOrderQuery, workerID, bidPrice, req.OrderID)
	if err != nil {
		return response.InternalServerError(c, "更新订单状态失败")
	}

	logQuery := `INSERT INTO order_status_logs (order_id, old_status, new_status, 
	             operator_id, operator_type, remark) VALUES (?, 0, 1, ?, 1, '用户接受抢单')`
	_, err = tx.Exec(logQuery, req.OrderID, userID)
	if err != nil {
		return response.InternalServerError(c, "插入状态日志失败")
	}

	if err := tx.Commit(); err != nil {
		return response.InternalServerError(c, "提交事务失败")
	}

	h.publishBidEvent("bid_accepted", req.OrderID, workerID)

	return response.SuccessWithMessage(c, "接受抢单成功", map[string]interface{}{
		"order_id":  req.OrderID,
		"worker_id": workerID,
	})
}

func (h *BidHandler) AutoDispatch(c echo.Context) error {
	userRole := middleware.GetUserRole(c)
	if userRole != 3 {
		return response.Forbidden(c, "只有管理员可以执行自动派单")
	}

	var req struct {
		OrderID uint64 `json:"order_id"`
	}

	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	if req.OrderID == 0 {
		return response.BadRequest(c, "订单ID不能为空")
	}

	worker, err := h.dispatchService.AutoDispatch(req.OrderID)
	if err != nil {
		return response.BadRequest(c, err.Error())
	}

	return response.SuccessWithMessage(c, "自动派单成功", map[string]interface{}{
		"order_id":  req.OrderID,
		"worker_id": worker.ID,
		"worker":    worker,
	})
}

func (h *BidHandler) getWorkerIDFromContext(c echo.Context) (uint64, error) {
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

func (h *BidHandler) publishBidEvent(eventType string, orderID, workerID uint64) {
	eventData := map[string]interface{}{
		"type":      eventType,
		"order_id":  orderID,
		"worker_id": workerID,
		"timestamp": time.Now().Unix(),
	}
	eventJSON, _ := json.Marshal(eventData)
	database.RedisClient.Publish(database.Ctx, "order:events", eventJSON)
}
