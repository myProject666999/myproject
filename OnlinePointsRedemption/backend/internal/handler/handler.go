package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/onlinemall/backend/internal/pkg/response"
	"github.com/onlinemall/backend/internal/service"
)

type UserHandler struct {
	pointsSvc  *service.PointsService
	productSvc *service.ProductService
	orderSvc   *service.OrderService
}

func NewUserHandler(
	pointsSvc *service.PointsService,
	productSvc *service.ProductService,
	orderSvc *service.OrderService,
) *UserHandler {
	return &UserHandler{
		pointsSvc:  pointsSvc,
		productSvc: productSvc,
		orderSvc:   orderSvc,
	}
}

func (h *UserHandler) GetPointsAccount(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	account, err := h.pointsSvc.GetAccount(userID)
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.Success(c, account)
}

func (h *UserHandler) ListPointsDetails(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	details, total, err := h.pointsSvc.ListDetails(userID, page, pageSize)
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"list":  details,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func (h *UserHandler) EarnPoints(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	var req struct {
		RuleCode string `json:"rule_code" binding:"required"`
		Remark   string `json:"remark"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := h.pointsSvc.EarnPoints(c.Request.Context(), userID, req.RuleCode, req.Remark); err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (h *UserHandler) GetRanking(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	ranking, err := h.pointsSvc.GetRanking(limit)
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.Success(c, ranking)
}

func getUserID(c *gin.Context) (uint64, error) {
	userIDStr := c.GetHeader("X-User-ID")
	if userIDStr == "" {
		return 0, nil
	}
	id, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		return 0, err
	}
	return id, nil
}

type ProductHandler struct {
	productSvc *service.ProductService
}

func NewProductHandler(productSvc *service.ProductService) *ProductHandler {
	return &ProductHandler{productSvc: productSvc}
}

func (h *ProductHandler) GetProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	product, stock, err := h.productSvc.GetProduct(id)
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"product": product,
		"stock":   stock,
	})
}

func (h *ProductHandler) ListProducts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	categoryID, _ := strconv.ParseUint(c.DefaultQuery("category_id", "0"), 10, 64)

	products, total, err := h.productSvc.ListProducts(page, pageSize, categoryID)
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"list":      products,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (h *ProductHandler) ListCategories(c *gin.Context) {
	categories, err := h.productSvc.ListCategories()
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.Success(c, categories)
}

type OrderHandler struct {
	orderSvc *service.OrderService
}

func NewOrderHandler(orderSvc *service.OrderService) *OrderHandler {
	return &OrderHandler{orderSvc: orderSvc}
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	var req service.CreateOrderReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}
	req.UserID = userID

	order, err := h.orderSvc.CreateOrder(c.Request.Context(), &req)
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.Success(c, order)
}

func (h *OrderHandler) GetOrder(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	order, err := h.orderSvc.GetOrder(id)
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}

	response.Success(c, order)
}

func (h *OrderHandler) ListUserOrders(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	orders, total, err := h.orderSvc.ListUserOrders(userID, page, pageSize)
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"list":      orders,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (h *OrderHandler) CancelOrder(c *gin.Context) {
	var req struct {
		OrderNo string `json:"order_no" binding:"required"`
		Reason  string `json:"reason"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := h.orderSvc.CancelOrder(c.Request.Context(), req.OrderNo, req.Reason); err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.Success(c, nil)
}

type AdminHandler struct {
	orderSvc *service.OrderService
}

func NewAdminHandler(orderSvc *service.OrderService) *AdminHandler {
	return &AdminHandler{orderSvc: orderSvc}
}

func (h *AdminHandler) ListOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	status, _ := strconv.Atoi(c.DefaultQuery("status", "-1"))

	orders, total, err := h.orderSvc.ListOrders(page, pageSize, int8(status))
	if err != nil {
		response.ServerError(c, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data": gin.H{
			"list":      orders,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func (h *AdminHandler) ShipOrder(c *gin.Context) {
	var req service.ShipOrderReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := h.orderSvc.ShipOrder(&req); err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (h *AdminHandler) CompleteOrder(c *gin.Context) {
	var req struct {
		OrderNo string `json:"order_no" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := h.orderSvc.CompleteOrder(req.OrderNo); err != nil {
		response.ServerError(c, err.Error())
		return
	}

	response.Success(c, nil)
}
