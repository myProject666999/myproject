package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"online-knowledge-paid/middleware"
	"online-knowledge-paid/pkg/response"
	"online-knowledge-paid/service"
)

var orderService = &service.OrderService{}

type OrderHandler struct{}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	var req struct {
		ColumnID uint64 `json:"column_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid request parameters")
		return
	}
	userID := middleware.GetUserID(c)
	db := getDB(c)
	column, err := columnService.GetColumnByID(db, req.ColumnID)
	if err != nil {
		response.Fail(c, http.StatusNotFound, "column not found")
		return
	}
	order, err := orderService.CreateOrder(db, userID, req.ColumnID, column.Price)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, order)
}

func (h *OrderHandler) PayOrder(c *gin.Context) {
	var req struct {
		OrderID   uint64 `json:"order_id"`
		PayMethod string `json:"pay_method"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid request parameters")
		return
	}
	db := getDB(c)
	order, err := orderService.PayOrder(db, req.OrderID, req.PayMethod)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, order)
}

func (h *OrderHandler) GetOrderByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	db := getDB(c)
	order, err := orderService.GetOrderByID(db, id)
	if err != nil {
		response.Fail(c, http.StatusNotFound, "order not found")
		return
	}
	response.Success(c, order)
}

func (h *OrderHandler) GetMyOrders(c *gin.Context) {
	userID := middleware.GetUserID(c)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	db := getDB(c)
	orders, total, err := orderService.GetOrdersByUser(db, userID, page, pageSize)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{
		"list":  orders,
		"total": total,
	})
}