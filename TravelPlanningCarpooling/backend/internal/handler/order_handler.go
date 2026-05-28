package handler

import (
	"carpooling/internal/middleware"
	"carpooling/internal/model"
	"carpooling/internal/service"
	"carpooling/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	service *service.OrderService
}

func NewOrderHandler() *OrderHandler {
	return &OrderHandler{
		service: service.NewOrderService(),
	}
}

func (h *OrderHandler) Create(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未登录")
		return
	}

	var req model.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	order, err := h.service.CreateOrder(userID, &req)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, order)
}

func (h *OrderHandler) Get(c *gin.Context) {
	orderID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的订单ID")
		return
	}

	order, err := h.service.GetOrder(orderID)
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}

	response.Success(c, order)
}

func (h *OrderHandler) List(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未登录")
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

	orders, total, err := h.service.ListOrders(userID, page, pageSize)
	if err != nil {
		response.InternalError(c, "查询失败")
		return
	}

	response.SuccessPage(c, orders, total, page, pageSize)
}

func (h *OrderHandler) Confirm(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未登录")
		return
	}

	orderID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的订单ID")
		return
	}

	if err := h.service.ConfirmOrder(orderID, userID); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (h *OrderHandler) Reject(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未登录")
		return
	}

	orderID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的订单ID")
		return
	}

	if err := h.service.RejectOrder(orderID, userID); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (h *OrderHandler) Start(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未登录")
		return
	}

	orderID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的订单ID")
		return
	}

	if err := h.service.StartOrder(orderID, userID); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (h *OrderHandler) Complete(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未登录")
		return
	}

	orderID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的订单ID")
		return
	}

	if err := h.service.CompleteOrder(orderID, userID); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (h *OrderHandler) Cancel(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未登录")
		return
	}

	orderID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的订单ID")
		return
	}

	var req model.CancelOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := h.service.CancelOrder(orderID, userID, req.Reason); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}
