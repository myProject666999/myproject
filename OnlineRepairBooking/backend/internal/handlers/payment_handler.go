package handlers

import (
	"crypto/rand"
	"database/sql"
	"fmt"
	"math/big"
	"strconv"
	"time"

	"online-repair-booking/internal/middleware"
	"online-repair-booking/internal/models"
	"online-repair-booking/pkg/database"
	"online-repair-booking/pkg/response"

	"github.com/labstack/echo/v4"
)

type PaymentHandler struct {
	paymentModel *models.PaymentModel
	orderModel   *models.OrderModel
}

func NewPaymentHandler(db *sql.DB) *PaymentHandler {
	return &PaymentHandler{
		paymentModel: models.NewPaymentModel(db),
		orderModel:   models.NewOrderModel(db),
	}
}

type CreatePaymentRequest struct {
	OrderID       uint64 `json:"order_id" validate:"required"`
	PaymentMethod int    `json:"payment_method" validate:"required"`
}

func (h *PaymentHandler) CreatePayment(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "请先登录")
	}

	req := new(CreatePaymentRequest)
	if err := c.Bind(req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	if req.OrderID == 0 {
		return response.BadRequest(c, "订单ID不能为空")
	}

	if req.PaymentMethod < models.PaymentMethodWechat || req.PaymentMethod > models.PaymentMethodBankCard {
		return response.BadRequest(c, "支付方式不正确")
	}

	tx, err := database.MySQL.Begin()
	if err != nil {
		return response.InternalServerError(c, "创建事务失败")
	}
	defer tx.Rollback()

	var orderUserID uint64
	var orderStatus int
	var orderAmount float64
	var orderWorkerID uint64
	var dispatchType int

	orderQuery := `SELECT user_id, status, pay_amount, worker_id, dispatch_type FROM ` + models.OrderTableName + ` WHERE id = ? FOR UPDATE`
	err = tx.QueryRow(orderQuery, req.OrderID).Scan(&orderUserID, &orderStatus, &orderAmount, &orderWorkerID, &dispatchType)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "订单不存在")
		}
		return response.InternalServerError(c, "获取订单信息失败")
	}

	if orderUserID != userID {
		return response.Forbidden(c, "您无权对该订单进行支付")
	}

	if orderStatus != models.OrderStatusPending && orderStatus != models.OrderStatusAccepted {
		return response.BadRequest(c, "订单状态不允许支付")
	}

	var existingPaymentCount int
	paymentCheckQuery := `SELECT COUNT(*) FROM ` + models.PaymentTableName + ` WHERE order_id = ? AND status = ?`
	err = tx.QueryRow(paymentCheckQuery, req.OrderID, models.PayStatusSuccess).Scan(&existingPaymentCount)
	if err != nil {
		return response.InternalServerError(c, "检查支付状态失败")
	}
	if existingPaymentCount > 0 {
		return response.BadRequest(c, "该订单已支付，请勿重复支付")
	}

	paymentNo := generatePaymentNo()

	insertPaymentQuery := `INSERT INTO ` + models.PaymentTableName + ` 
		(payment_no, order_id, amount, payment_method, status) 
		VALUES (?, ?, ?, ?, ?)`
	result, err := tx.Exec(insertPaymentQuery, paymentNo, req.OrderID, orderAmount, req.PaymentMethod, models.PayStatusPending)
	if err != nil {
		return response.InternalServerError(c, "创建支付记录失败")
	}

	paymentID, err := result.LastInsertId()
	if err != nil {
		return response.InternalServerError(c, "获取支付ID失败")
	}

	if err := tx.Commit(); err != nil {
		return response.InternalServerError(c, "提交事务失败")
	}

	return response.SuccessWithMessage(c, "支付记录创建成功", map[string]interface{}{
		"payment_id":   uint64(paymentID),
		"payment_no":   paymentNo,
		"order_id":     req.OrderID,
		"amount":       orderAmount,
		"payment_type": req.PaymentMethod,
		"status":       models.PayStatusPending,
	})
}

type ProcessPaymentRequest struct {
	PaymentID uint64 `json:"payment_id" validate:"required"`
}

func (h *PaymentHandler) ProcessPayment(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "请先登录")
	}

	req := new(ProcessPaymentRequest)
	if err := c.Bind(req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	if req.PaymentID == 0 {
		return response.BadRequest(c, "支付ID不能为空")
	}

	tx, err := database.MySQL.Begin()
	if err != nil {
		return response.InternalServerError(c, "创建事务失败")
	}
	defer tx.Rollback()

	var paymentOrderID uint64
	var paymentStatus int
	var paymentAmount float64

	paymentQuery := `SELECT order_id, status, amount FROM ` + models.PaymentTableName + ` WHERE id = ? FOR UPDATE`
	err = tx.QueryRow(paymentQuery, req.PaymentID).Scan(&paymentOrderID, &paymentStatus, &paymentAmount)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "支付记录不存在")
		}
		return response.InternalServerError(c, "获取支付信息失败")
	}

	if paymentStatus != models.PayStatusPending {
		return response.BadRequest(c, "支付状态不正确，无法处理")
	}

	var orderUserID uint64
	var orderStatus int
	var dispatchType int
	var orderWorkerID uint64

	orderQuery := `SELECT user_id, status, dispatch_type, worker_id FROM ` + models.OrderTableName + ` WHERE id = ? FOR UPDATE`
	err = tx.QueryRow(orderQuery, paymentOrderID).Scan(&orderUserID, &orderStatus, &dispatchType, &orderWorkerID)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "订单不存在")
		}
		return response.InternalServerError(c, "获取订单信息失败")
	}

	if orderUserID != userID {
		return response.Forbidden(c, "您无权处理该支付")
	}

	transactionID := generateTransactionID()

	updatePaymentQuery := `UPDATE ` + models.PaymentTableName + ` 
		SET status = ?, transaction_id = ?, paid_at = NOW() 
		WHERE id = ?`
	_, err = tx.Exec(updatePaymentQuery, models.PayStatusSuccess, transactionID, req.PaymentID)
	if err != nil {
		return response.InternalServerError(c, "更新支付状态失败")
	}

	newStatus := orderStatus
	if dispatchType == 1 && orderStatus == models.OrderStatusPending && orderWorkerID > 0 {
		newStatus = models.OrderStatusAccepted
	}

	updateOrderQuery := `UPDATE ` + models.OrderTableName + ` 
		SET paid_at = NOW(), status = ? 
		WHERE id = ?`
	_, err = tx.Exec(updateOrderQuery, newStatus, paymentOrderID)
	if err != nil {
		return response.InternalServerError(c, "更新订单支付时间失败")
	}

	if newStatus != orderStatus {
		insertLogQuery := `INSERT INTO ` + models.OrderStatusLogTableName + ` 
			(order_id, old_status, new_status, operator_id, operator_type, remark) 
			VALUES (?, ?, ?, ?, 1, '支付成功，订单已确认')`
		_, err = tx.Exec(insertLogQuery, paymentOrderID, orderStatus, newStatus, userID)
		if err != nil {
			return response.InternalServerError(c, "插入状态日志失败")
		}
	}

	if err := tx.Commit(); err != nil {
		return response.InternalServerError(c, "提交事务失败")
	}

	return response.SuccessWithMessage(c, "支付成功", map[string]interface{}{
		"payment_id":     req.PaymentID,
		"order_id":       paymentOrderID,
		"amount":         paymentAmount,
		"transaction_id": transactionID,
		"status":         models.PayStatusSuccess,
		"paid_at":        time.Now().Format("2006-01-02 15:04:05"),
		"order_status":   newStatus,
	})
}

func (h *PaymentHandler) GetPaymentStatus(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "请先登录")
	}

	paymentIDStr := c.QueryParam("payment_id")
	orderIDStr := c.QueryParam("order_id")

	if paymentIDStr == "" && orderIDStr == "" {
		return response.BadRequest(c, "请指定支付ID或订单ID")
	}

	var payment *models.Payment
	var err error

	if paymentIDStr != "" {
		paymentID, err := strconv.ParseUint(paymentIDStr, 10, 64)
		if err != nil {
			return response.BadRequest(c, "支付ID格式错误")
		}
		payment, err = h.paymentModel.GetByID(paymentID)
	} else {
		orderID, err := strconv.ParseUint(orderIDStr, 10, 64)
		if err != nil {
			return response.BadRequest(c, "订单ID格式错误")
		}
		payment, err = h.paymentModel.GetByOrderID(orderID)
	}

	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "支付记录不存在")
		}
		return response.InternalServerError(c, "获取支付状态失败")
	}

	var orderUserID uint64
	orderQuery := `SELECT user_id FROM ` + models.OrderTableName + ` WHERE id = ?`
	err = database.MySQL.QueryRow(orderQuery, payment.OrderID).Scan(&orderUserID)
	if err != nil {
		return response.InternalServerError(c, "获取订单信息失败")
	}

	userRole := middleware.GetUserRole(c)
	if orderUserID != userID && userRole != middleware.RoleAdmin {
		return response.Forbidden(c, "您无权查看该支付状态")
	}

	statusText := map[int]string{
		models.PayStatusPending: "待支付",
		models.PayStatusSuccess: "支付成功",
		models.PayStatusFailed:  "支付失败",
		models.PayStatusRefund:  "已退款",
	}

	paymentMethodText := map[int]string{
		models.PaymentMethodWechat:   "微信支付",
		models.PaymentMethodAlipay:   "支付宝",
		models.PaymentMethodBankCard: "银行卡",
	}

	result := map[string]interface{}{
		"payment_id":     payment.ID,
		"payment_no":     payment.PaymentNo,
		"order_id":       payment.OrderID,
		"amount":         payment.Amount,
		"payment_method": payment.PaymentMethod,
		"payment_method_text": paymentMethodText[payment.PaymentMethod],
		"status":         payment.Status,
		"status_text":    statusText[payment.Status],
		"transaction_id": payment.TransactionID,
	}

	if !payment.PaidAt.IsZero() {
		result["paid_at"] = payment.PaidAt.Format("2006-01-02 15:04:05")
	}

	return response.Success(c, result)
}

func generatePaymentNo() string {
	now := time.Now().Format("20060102150405")
	random := generateRandomString(6)
	return fmt.Sprintf("PAY%s%s", now, random)
}

func generateTransactionID() string {
	now := time.Now().Format("20060102150405")
	random := generateRandomString(10)
	return fmt.Sprintf("TXN%s%s", now, random)
}

func generateRandomString(length int) string {
	const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	result := make([]byte, length)
	for i := range result {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		result[i] = charset[num.Int64()]
	}
	return string(result)
}
