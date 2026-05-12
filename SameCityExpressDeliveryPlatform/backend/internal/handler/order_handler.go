package handler

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"samecity-express/internal/service"
	"samecity-express/pkg/utils"
)

type OrderHandler struct {
	service *service.OrderService
}

func NewOrderHandler() *OrderHandler {
	return &OrderHandler{
		service: service.NewOrderService(),
	}
}

type CalculatePriceRequest struct {
	PickupLongitude   float64 `json:"pickup_longitude" binding:"required"`
	PickupLatitude    float64 `json:"pickup_latitude" binding:"required"`
	DeliveryLongitude float64 `json:"delivery_longitude" binding:"required"`
	DeliveryLatitude  float64 `json:"delivery_latitude" binding:"required"`
	Weight            float64 `json:"weight"`
}

func (h *OrderHandler) CalculatePrice(c *gin.Context) {
	var req CalculatePriceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if req.Weight <= 0 {
		req.Weight = 1.0
	}

	priceReq := &service.CalculatePriceRequest{
		PickupLongitude:   req.PickupLongitude,
		PickupLatitude:    req.PickupLatitude,
		DeliveryLongitude: req.DeliveryLongitude,
		DeliveryLatitude:  req.DeliveryLatitude,
		Weight:            req.Weight,
	}

	result, err := h.service.CalculatePrice(priceReq)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, result)
}

type CreateOrderRequest struct {
	PickupName        string  `json:"pickup_name" binding:"required"`
	PickupPhone       string  `json:"pickup_phone" binding:"required"`
	PickupAddress     string  `json:"pickup_address" binding:"required"`
	PickupLongitude   float64 `json:"pickup_longitude" binding:"required"`
	PickupLatitude    float64 `json:"pickup_latitude" binding:"required"`
	DeliveryName      string  `json:"delivery_name" binding:"required"`
	DeliveryPhone     string  `json:"delivery_phone" binding:"required"`
	DeliveryAddress   string  `json:"delivery_address" binding:"required"`
	DeliveryLongitude float64 `json:"delivery_longitude" binding:"required"`
	DeliveryLatitude  float64 `json:"delivery_latitude" binding:"required"`
	ItemType          int     `json:"item_type" binding:"required"`
	ItemName          string  `json:"item_name"`
	Weight            float64 `json:"weight"`
	ItemValue         float64 `json:"item_value"`
	Quantity          int     `json:"quantity"`
	Remark            string  `json:"remark"`
	RequireTime       string  `json:"require_time"`
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if req.Weight <= 0 {
		req.Weight = 1.0
	}

	if req.Quantity <= 0 {
		req.Quantity = 1
	}

	var requireTime time.Time
	if req.RequireTime != "" {
		parsedTime, err := time.ParseInLocation("2006-01-02 15:04:05", req.RequireTime, time.Local)
		if err != nil {
			utils.BadRequest(c, "时间格式错误")
			return
		}
		requireTime = parsedTime
	}

	orderReq := &service.CreateOrderRequest{
		PickupName:        req.PickupName,
		PickupPhone:       req.PickupPhone,
		PickupAddress:     req.PickupAddress,
		PickupLongitude:   req.PickupLongitude,
		PickupLatitude:    req.PickupLatitude,
		DeliveryName:      req.DeliveryName,
		DeliveryPhone:     req.DeliveryPhone,
		DeliveryAddress:   req.DeliveryAddress,
		DeliveryLongitude: req.DeliveryLongitude,
		DeliveryLatitude:  req.DeliveryLatitude,
		ItemType:          req.ItemType,
		ItemName:          req.ItemName,
		Weight:            req.Weight,
		ItemValue:         req.ItemValue,
		Quantity:          req.Quantity,
		Remark:            req.Remark,
		RequireTime:       requireTime,
	}

	order, err := h.service.CreateOrder(userID, orderReq)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, order)
}

type AcceptOrderRequest struct {
	OrderID uint `json:"order_id" binding:"required"`
}

func (h *OrderHandler) AcceptOrder(c *gin.Context) {
	riderID := c.GetUint("rider_id")

	var req AcceptOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	order, err := h.service.AcceptOrder(riderID, req.OrderID)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, order)
}

type PickupOrderRequest struct {
	OrderID     uint   `json:"order_id" binding:"required"`
	PickupPhoto string `json:"pickup_photo"`
}

func (h *OrderHandler) PickupOrder(c *gin.Context) {
	riderID := c.GetUint("rider_id")

	var req PickupOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	order, err := h.service.PickupOrder(riderID, req.OrderID, req.PickupPhoto)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, order)
}

type DeliverOrderRequest struct {
	OrderID       uint   `json:"order_id" binding:"required"`
	SignCode      string `json:"sign_code" binding:"required"`
	DeliveryPhoto string `json:"delivery_photo"`
}

func (h *OrderHandler) DeliverOrder(c *gin.Context) {
	riderID := c.GetUint("rider_id")

	var req DeliverOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	order, err := h.service.DeliverOrder(riderID, req.OrderID, req.SignCode, req.DeliveryPhoto)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, order)
}

type CancelOrderRequest struct {
	OrderID uint   `json:"order_id" binding:"required"`
	Reason  string `json:"reason" binding:"required"`
}

func (h *OrderHandler) CancelOrder(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req CancelOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	order, err := h.service.CancelOrder(userID, req.OrderID, req.Reason)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, order)
}

func (h *OrderHandler) GetOrder(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.BadRequest(c, "订单ID无效")
		return
	}

	order, err := h.service.GetOrderByID(uint(id))
	if err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	utils.Success(c, order)
}

func (h *OrderHandler) GetUserOrders(c *gin.Context) {
	userID := c.GetUint("user_id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	var status *int
	if statusStr := c.Query("status"); statusStr != "" {
		s, err := strconv.Atoi(statusStr)
		if err == nil {
			status = &s
		}
	}

	orders, total, err := h.service.GetUserOrders(userID, status, page, pageSize)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, gin.H{
		"orders": orders,
		"total":  total,
		"page":   page,
		"size":   pageSize,
	})
}

func (h *OrderHandler) GetRiderOrders(c *gin.Context) {
	riderID := c.GetUint("rider_id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	var status *int
	if statusStr := c.Query("status"); statusStr != "" {
		s, err := strconv.Atoi(statusStr)
		if err == nil {
			status = &s
		}
	}

	orders, total, err := h.service.GetRiderOrders(riderID, status, page, pageSize)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, gin.H{
		"orders": orders,
		"total":  total,
		"page":   page,
		"size":   pageSize,
	})
}

func (h *OrderHandler) GetAvailableOrders(c *gin.Context) {
	riderID := c.GetUint("rider_id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	longitude, _ := strconv.ParseFloat(c.Query("longitude"), 64)
	latitude, _ := strconv.ParseFloat(c.Query("latitude"), 64)

	orders, total, err := h.service.GetAvailableOrders(riderID, longitude, latitude, page, pageSize)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, gin.H{
		"orders": orders,
		"total":  total,
		"page":   page,
		"size":   pageSize,
	})
}

func (h *OrderHandler) GetOrderTracks(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.BadRequest(c, "订单ID无效")
		return
	}

	tracks, err := h.service.GetOrderTracks(uint(id))
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, tracks)
}

type RateOrderRequest struct {
	OrderID uint   `json:"order_id" binding:"required"`
	Rating  int    `json:"rating" binding:"required"`
	Comment string `json:"comment"`
}

func (h *OrderHandler) RateOrder(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req RateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if req.Rating < 1 || req.Rating > 5 {
		utils.BadRequest(c, "评分必须在1-5之间")
		return
	}

	order, err := h.service.RateOrder(userID, req.OrderID, req.Rating, req.Comment)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, order)
}
