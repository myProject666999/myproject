package handler

import (
	"carpooling/internal/middleware"
	"carpooling/internal/model"
	"carpooling/internal/service"
	"carpooling/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ReviewHandler struct {
	reviewService *service.ReviewService
}

func NewReviewHandler() *ReviewHandler {
	return &ReviewHandler{
		reviewService: service.NewReviewService(),
	}
}

func (h *ReviewHandler) Create(c *gin.Context) {
	var req model.CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未获取到用户信息")
		return
	}

	result, err := h.reviewService.CreateReview(userID, &req)
	if err != nil {
		response.InternalError(c, "创建评价失败")
		return
	}

	response.Success(c, result)
}

func (h *ReviewHandler) GetUserReviews(c *gin.Context) {
	userIDStr := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的用户ID")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	list, total, err := h.reviewService.GetUserReviews(userID, page, pageSize)
	if err != nil {
		response.InternalError(c, "获取用户评价失败")
		return
	}

	response.SuccessPage(c, list, total, page, pageSize)
}
