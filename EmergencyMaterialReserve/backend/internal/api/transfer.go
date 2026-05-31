package api

import (
	"strconv"

	"emergency-material/internal/middleware"
	"emergency-material/internal/service"
	"emergency-material/pkg/response"

	"github.com/gin-gonic/gin"
)

type TransferController struct {
	transferService *service.TransferOrderService
}

func NewTransferController() *TransferController {
	return &TransferController{
		transferService: service.NewTransferOrderService(),
	}
}

func (ctrl *TransferController) GetList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := &service.TransferOrderQuery{
		Page:     page,
		PageSize: pageSize,
		OrderNo:  c.Query("order_no"),
		Status:   c.Query("status"),
		Type:     c.Query("type"),
		Priority: c.Query("priority"),
	}

	if fromWarehouseIDStr := c.Query("from_warehouse_id"); fromWarehouseIDStr != "" {
		if id, err := strconv.ParseUint(fromWarehouseIDStr, 10, 64); err == nil {
			query.FromWarehouseID = &id
		}
	}

	if toWarehouseIDStr := c.Query("to_warehouse_id"); toWarehouseIDStr != "" {
		if id, err := strconv.ParseUint(toWarehouseIDStr, 10, 64); err == nil {
			query.ToWarehouseID = &id
		}
	}

	if startDate := c.Query("start_date"); startDate != "" {
		query.StartDate = &startDate
	}

	if endDate := c.Query("end_date"); endDate != "" {
		query.EndDate = &endDate
	}

	result, err := ctrl.transferService.GetTransferOrderList(c.Request.Context(), query)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, result)
}

func (ctrl *TransferController) GetDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	order, err := ctrl.transferService.GetTransferOrderDetail(c.Request.Context(), id)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, order)
}

func (ctrl *TransferController) Create(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	var req service.CreateTransferOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.ApplicantID = userID.(uint64)
	req.ApplicantName = username.(string)

	order, err := ctrl.transferService.CreateTransferOrder(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, order)
}

func (ctrl *TransferController) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	var req service.CreateTransferOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.ApplicantID = userID.(uint64)
	req.ApplicantName = username.(string)

	order, err := ctrl.transferService.CreateTransferOrder(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	_ = id

	response.Success(c, order)
}

func (ctrl *TransferController) Submit(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	req := &service.SubmitTransferOrderRequest{
		OrderID:       id,
		ApplicantID:   userID.(uint64),
		ApplicantName: username.(string),
	}

	order, err := ctrl.transferService.SubmitTransferOrder(c.Request.Context(), req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, order)
}

func (ctrl *TransferController) Approve(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	var req service.ApproveTransferOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.OrderID = id
	req.ApproverID = userID.(uint64)
	req.ApproverName = username.(string)

	order, err := ctrl.transferService.ApproveTransferOrder(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, order)
}

func (ctrl *TransferController) Reject(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	var req service.RejectTransferOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.OrderID = id
	req.ApproverID = userID.(uint64)
	req.ApproverName = username.(string)

	order, err := ctrl.transferService.RejectTransferOrder(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, order)
}

func (ctrl *TransferController) Send(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	var req service.SendTransferOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.OrderID = id
	req.SenderID = userID.(uint64)
	req.SenderName = username.(string)

	order, err := ctrl.transferService.SendTransferOrder(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, order)
}

func (ctrl *TransferController) Receive(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	var req service.ReceiveTransferOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.OrderID = id
	req.ReceiverID = userID.(uint64)
	req.ReceiverName = username.(string)

	order, err := ctrl.transferService.ReceiveTransferOrder(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, order)
}

func (ctrl *TransferController) Complete(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	req := &service.CompleteTransferOrderRequest{
		OrderID:      id,
		OperatorID:   userID.(uint64),
		OperatorName: username.(string),
	}

	order, err := ctrl.transferService.CompleteTransferOrder(c.Request.Context(), req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, order)
}

func (ctrl *TransferController) Cancel(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	req := &service.CancelTransferOrderRequest{
		OrderID:      id,
		OperatorID:   userID.(uint64),
		OperatorName: username.(string),
	}

	order, err := ctrl.transferService.CancelTransferOrder(c.Request.Context(), req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, order)
}
