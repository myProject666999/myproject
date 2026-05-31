package api

import (
	"strconv"

	"emergency-material/internal/middleware"
	"emergency-material/internal/service"
	"emergency-material/pkg/response"

	"github.com/gin-gonic/gin"
)

type DemandController struct {
	demandService *service.DemandRequestService
}

func NewDemandController() *DemandController {
	return &DemandController{
		demandService: service.NewDemandRequestService(),
	}
}

func (ctrl *DemandController) GetList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := &service.DemandRequestQuery{
		Page:           page,
		PageSize:       pageSize,
		RequestNo:      c.Query("request_no"),
		Status:         c.Query("status"),
		Department:     c.Query("department"),
		EmergencyLevel: c.Query("emergency_level"),
	}

	if applicantIDStr := c.Query("applicant_id"); applicantIDStr != "" {
		if id, err := strconv.ParseUint(applicantIDStr, 10, 64); err == nil {
			query.ApplicantID = &id
		}
	}

	if startDate := c.Query("start_date"); startDate != "" {
		query.StartDate = &startDate
	}

	if endDate := c.Query("end_date"); endDate != "" {
		query.EndDate = &endDate
	}

	result, err := ctrl.demandService.GetDemandRequestList(c.Request.Context(), query)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, result)
}

func (ctrl *DemandController) GetDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	request, err := ctrl.demandService.GetDemandRequestDetail(c.Request.Context(), id)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, request)
}

func (ctrl *DemandController) Create(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	var req service.CreateDemandRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.ApplicantID = userID.(uint64)
	req.ApplicantName = username.(string)

	request, err := ctrl.demandService.CreateDemandRequest(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, request)
}

func (ctrl *DemandController) Update(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	var req service.CreateDemandRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.ApplicantID = userID.(uint64)
	req.ApplicantName = username.(string)

	request, err := ctrl.demandService.CreateDemandRequest(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	_ = id

	response.Success(c, request)
}

func (ctrl *DemandController) Submit(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	req := &service.SubmitDemandRequestRequest{
		RequestID:     id,
		ApplicantID:   userID.(uint64),
		ApplicantName: username.(string),
	}

	request, err := ctrl.demandService.SubmitDemandRequest(c.Request.Context(), req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, request)
}

func (ctrl *DemandController) Approve(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	var req service.ApproveDemandRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.RequestID = id
	req.ApproverID = userID.(uint64)
	req.ApproverName = username.(string)

	request, err := ctrl.demandService.ApproveDemandRequest(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, request)
}

func (ctrl *DemandController) Reject(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	var req service.RejectDemandRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.RequestID = id
	req.ApproverID = userID.(uint64)
	req.ApproverName = username.(string)

	request, err := ctrl.demandService.RejectDemandRequest(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, request)
}

func (ctrl *DemandController) Complete(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	req := &service.CompleteDemandRequestRequest{
		RequestID:    id,
		OperatorID:   userID.(uint64),
		OperatorName: username.(string),
	}

	request, err := ctrl.demandService.CompleteDemandRequest(c.Request.Context(), req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, request)
}
