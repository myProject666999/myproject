package handlers

import (
	"database/sql"
	"fmt"
	"strconv"
	"strings"

	"online-repair-booking/internal/middleware"
	"online-repair-booking/internal/models"
	"online-repair-booking/pkg/database"
	"online-repair-booking/pkg/response"

	"github.com/labstack/echo/v4"
)

type ReviewHandler struct {
	reviewModel *models.ReviewModel
	orderModel  *models.OrderModel
	workerModel *models.WorkerModel
}

func NewReviewHandler(db *sql.DB) *ReviewHandler {
	return &ReviewHandler{
		reviewModel: models.NewReviewModel(db),
		orderModel:  models.NewOrderModel(db),
		workerModel: models.NewWorkerModel(db),
	}
}

type CreateReviewRequest struct {
	OrderID     uint64   `json:"order_id" validate:"required"`
	Rating      int      `json:"rating" validate:"required,min=1,max=5"`
	Content     string   `json:"content"`
	Images      []string `json:"images"`
	IsAnonymous int      `json:"is_anonymous"`
}

func (h *ReviewHandler) CreateReview(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "请先登录")
	}

	req := new(CreateReviewRequest)
	if err := c.Bind(req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	if req.OrderID == 0 {
		return response.BadRequest(c, "订单ID不能为空")
	}

	if req.Rating < 1 || req.Rating > 5 {
		return response.BadRequest(c, "评分必须在1-5之间")
	}

	tx, err := database.MySQL.Begin()
	if err != nil {
		return response.InternalServerError(c, "创建事务失败")
	}
	defer tx.Rollback()

	var orderUserID uint64
	var orderWorkerID uint64
	var orderServiceID uint64
	var orderStatus int

	orderQuery := `SELECT user_id, worker_id, service_id, status FROM ` + models.OrderTableName + ` WHERE id = ? FOR UPDATE`
	err = tx.QueryRow(orderQuery, req.OrderID).Scan(&orderUserID, &orderWorkerID, &orderServiceID, &orderStatus)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "订单不存在")
		}
		return response.InternalServerError(c, "获取订单信息失败")
	}

	if orderUserID != userID {
		return response.Forbidden(c, "您无权对该订单进行评价")
	}

	if orderStatus != models.OrderStatusToReview && orderStatus != models.OrderStatusCompleted {
		return response.BadRequest(c, "订单状态不允许评价")
	}

	var existingReviewCount int
	reviewCheckQuery := `SELECT COUNT(*) FROM ` + models.ReviewTableName + ` WHERE order_id = ?`
	err = tx.QueryRow(reviewCheckQuery, req.OrderID).Scan(&existingReviewCount)
	if err != nil {
		return response.InternalServerError(c, "检查评价状态失败")
	}
	if existingReviewCount > 0 {
		return response.BadRequest(c, "该订单已评价，请勿重复评价")
	}

	imagesStr := ""
	if len(req.Images) > 0 {
		imagesStr = strings.Join(req.Images, ",")
	}

	isAnonymous := 0
	if req.IsAnonymous == 1 {
		isAnonymous = 1
	}

	insertReviewQuery := `INSERT INTO ` + models.ReviewTableName + ` 
		(order_id, user_id, worker_id, service_id, rating, content, images, is_anonymous) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	result, err := tx.Exec(insertReviewQuery, req.OrderID, userID, orderWorkerID, orderServiceID, req.Rating, req.Content, imagesStr, isAnonymous)
	if err != nil {
		return response.InternalServerError(c, "创建评价失败")
	}

	reviewID, err := result.LastInsertId()
	if err != nil {
		return response.InternalServerError(c, "获取评价ID失败")
	}

	var avgRating float64
	var reviewCount int64
	avgQuery := `SELECT AVG(rating), COUNT(*) FROM ` + models.ReviewTableName + ` WHERE worker_id = ?`
	err = tx.QueryRow(avgQuery, orderWorkerID).Scan(&avgRating, &reviewCount)
	if err != nil {
		return response.InternalServerError(c, "计算平均评分失败")
	}

	updateWorkerQuery := `UPDATE ` + models.WorkerTableName + ` SET rating = ?, review_count = ? WHERE id = ?`
	_, err = tx.Exec(updateWorkerQuery, avgRating, int(reviewCount), orderWorkerID)
	if err != nil {
		return response.InternalServerError(c, "更新师傅评分失败")
	}

	updateOrderQuery := `UPDATE ` + models.OrderTableName + ` SET status = ? WHERE id = ?`
	_, err = tx.Exec(updateOrderQuery, models.OrderStatusCompleted, req.OrderID)
	if err != nil {
		return response.InternalServerError(c, "更新订单状态失败")
	}

	insertLogQuery := `INSERT INTO ` + models.OrderStatusLogTableName + ` 
		(order_id, old_status, new_status, operator_id, operator_type, remark) 
		VALUES (?, ?, ?, ?, 1, '用户评价完成')`
	_, err = tx.Exec(insertLogQuery, req.OrderID, orderStatus, models.OrderStatusCompleted, userID)
	if err != nil {
		return response.InternalServerError(c, "插入状态日志失败")
	}

	if err := tx.Commit(); err != nil {
		return response.InternalServerError(c, "提交事务失败")
	}

	return response.SuccessWithMessage(c, "评价创建成功", map[string]interface{}{
		"review_id": uint64(reviewID),
		"order_id":  req.OrderID,
		"rating":    req.Rating,
	})
}

func (h *ReviewHandler) GetReviewList(c echo.Context) error {
	serviceIDStr := c.QueryParam("service_id")
	workerIDStr := c.QueryParam("worker_id")
	pageStr := c.QueryParam("page")
	pageSizeStr := c.QueryParam("page_size")

	if serviceIDStr == "" && workerIDStr == "" {
		return response.BadRequest(c, "请指定服务ID或师傅ID")
	}

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

	var reviews []*models.Review
	var total int64
	var err error

	if serviceIDStr != "" {
		serviceID, err := strconv.ParseUint(serviceIDStr, 10, 64)
		if err != nil {
			return response.BadRequest(c, "服务ID格式错误")
		}
		reviews, total, err = h.reviewModel.ListByServiceID(serviceID, page, pageSize)
	} else {
		workerID, err := strconv.ParseUint(workerIDStr, 10, 64)
		if err != nil {
			return response.BadRequest(c, "师傅ID格式错误")
		}
		reviews, total, err = h.reviewModel.ListByWorkerID(workerID, page, pageSize)
	}

	if err != nil {
		return response.InternalServerError(c, "获取评价列表失败")
	}

	type ReviewItem struct {
		ID           uint64 `json:"id"`
		OrderID      uint64 `json:"order_id"`
		UserID       uint64 `json:"user_id"`
		WorkerID     uint64 `json:"worker_id"`
		ServiceID    uint64 `json:"service_id"`
		Rating       int    `json:"rating"`
		Content      string `json:"content"`
		Images       string `json:"images"`
		IsAnonymous  int    `json:"is_anonymous"`
		Username     string `json:"username,omitempty"`
		Avatar       string `json:"avatar,omitempty"`
		ReplyContent string `json:"reply_content"`
		ReplyAt      string `json:"reply_at"`
		CreatedAt    string `json:"created_at"`
	}

	reviewItems := make([]*ReviewItem, 0)
	for _, review := range reviews {
		item := &ReviewItem{
			ID:           review.ID,
			OrderID:      review.OrderID,
			UserID:       review.UserID,
			WorkerID:     review.WorkerID,
			ServiceID:    review.ServiceID,
			Rating:       review.Rating,
			Content:      review.Content,
			Images:       review.Images,
			IsAnonymous:  review.IsAnonymous,
			ReplyContent: review.ReplyContent,
			CreatedAt:    review.CreatedAt.Format("2006-01-02 15:04:05"),
		}

		if !review.ReplyAt.IsZero() {
			item.ReplyAt = review.ReplyAt.Format("2006-01-02 15:04:05")
		}

		if review.IsAnonymous == 0 {
			var username, avatar string
			userQuery := `SELECT username, avatar FROM users WHERE id = ?`
			database.MySQL.QueryRow(userQuery, review.UserID).Scan(&username, &avatar)
			item.Username = username
			item.Avatar = avatar
		} else {
			item.Username = "匿名用户"
			item.Avatar = ""
		}

		reviewItems = append(reviewItems, item)
	}

	result := &PaginationResult{
		List:     reviewItems,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}

	return response.Success(c, result)
}

func (h *ReviewHandler) GetMyReviews(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
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

	reviews, total, err := h.reviewModel.ListByUserID(userID, page, pageSize)
	if err != nil {
		return response.InternalServerError(c, "获取我的评价失败")
	}

	type MyReviewItem struct {
		ID           uint64 `json:"id"`
		OrderID      uint64 `json:"order_id"`
		WorkerID     uint64 `json:"worker_id"`
		ServiceID    uint64 `json:"service_id"`
		ServiceName  string `json:"service_name"`
		WorkerName   string `json:"worker_name"`
		Rating       int    `json:"rating"`
		Content      string `json:"content"`
		Images       string `json:"images"`
		IsAnonymous  int    `json:"is_anonymous"`
		ReplyContent string `json:"reply_content"`
		ReplyAt      string `json:"reply_at"`
		CreatedAt    string `json:"created_at"`
	}

	reviewItems := make([]*MyReviewItem, 0)
	for _, review := range reviews {
		item := &MyReviewItem{
			ID:           review.ID,
			OrderID:      review.OrderID,
			WorkerID:     review.WorkerID,
			ServiceID:    review.ServiceID,
			Rating:       review.Rating,
			Content:      review.Content,
			Images:       review.Images,
			IsAnonymous:  review.IsAnonymous,
			ReplyContent: review.ReplyContent,
			CreatedAt:    review.CreatedAt.Format("2006-01-02 15:04:05"),
		}

		if !review.ReplyAt.IsZero() {
			item.ReplyAt = review.ReplyAt.Format("2006-01-02 15:04:05")
		}

		var serviceName string
		serviceQuery := `SELECT name FROM services WHERE id = ?`
		database.MySQL.QueryRow(serviceQuery, review.ServiceID).Scan(&serviceName)
		item.ServiceName = serviceName

		var workerName string
		workerQuery := `SELECT real_name FROM workers WHERE id = ?`
		database.MySQL.QueryRow(workerQuery, review.WorkerID).Scan(&workerName)
		item.WorkerName = workerName

		reviewItems = append(reviewItems, item)
	}

	result := &PaginationResult{
		List:     reviewItems,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}

	return response.Success(c, result)
}

type ReplyReviewRequest struct {
	ReviewID     uint64 `json:"review_id" validate:"required"`
	ReplyContent string `json:"reply_content" validate:"required"`
}

func (h *ReviewHandler) ReplyReview(c echo.Context) error {
	workerID, err := h.getWorkerIDFromContext(c)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	req := new(ReplyReviewRequest)
	if err := c.Bind(req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	if req.ReviewID == 0 {
		return response.BadRequest(c, "评价ID不能为空")
	}

	if req.ReplyContent == "" {
		return response.BadRequest(c, "回复内容不能为空")
	}

	tx, err := database.MySQL.Begin()
	if err != nil {
		return response.InternalServerError(c, "创建事务失败")
	}
	defer tx.Rollback()

	var reviewWorkerID uint64
	var replyContent sql.NullString

	reviewQuery := `SELECT worker_id, reply_content FROM ` + models.ReviewTableName + ` WHERE id = ? FOR UPDATE`
	err = tx.QueryRow(reviewQuery, req.ReviewID).Scan(&reviewWorkerID, &replyContent)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "评价不存在")
		}
		return response.InternalServerError(c, "获取评价信息失败")
	}

	if reviewWorkerID != workerID {
		return response.Forbidden(c, "您无权回复该评价")
	}

	if replyContent.Valid && replyContent.String != "" {
		return response.BadRequest(c, "该评价已回复，请勿重复回复")
	}

	updateReplyQuery := `UPDATE ` + models.ReviewTableName + ` SET reply_content = ?, reply_at = NOW() WHERE id = ?`
	_, err = tx.Exec(updateReplyQuery, req.ReplyContent, req.ReviewID)
	if err != nil {
		return response.InternalServerError(c, "回复评价失败")
	}

	if err := tx.Commit(); err != nil {
		return response.InternalServerError(c, "提交事务失败")
	}

	return response.SuccessWithMessage(c, "回复成功", map[string]interface{}{
		"review_id": req.ReviewID,
	})
}

func (h *ReviewHandler) getWorkerIDFromContext(c echo.Context) (uint64, error) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return 0, fmt.Errorf("请先登录")
	}

	userRole := middleware.GetUserRole(c)
	if userRole != middleware.RoleWorker && userRole != middleware.RoleAdmin {
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
