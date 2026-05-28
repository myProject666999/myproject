package handler

import (
	"carpooling/internal/middleware"
	"carpooling/internal/model"
	"carpooling/internal/service"
	"carpooling/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type RequestHandler struct {
	requestService *service.RequestService
}

func NewRequestHandler() *RequestHandler {
	return &RequestHandler{
		requestService: service.NewRequestService(),
	}
}

func (h *RequestHandler) Create(c *gin.Context) {
	var req model.CreateRideRequestReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未获取到用户信息")
		return
	}

	result, err := h.requestService.CreateRequest(userID, &req)
	if err != nil {
		response.InternalError(c, "创建出行请求失败")
		return
	}

	response.Success(c, result)
}

func (h *RequestHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的请求ID")
		return
	}

	result, err := h.requestService.GetRequest(id)
	if err != nil {
		response.NotFound(c, "出行请求不存在")
		return
	}

	response.Success(c, result)
}

func (h *RequestHandler) List(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未获取到用户信息")
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

	list, total, err := h.requestService.ListRequests(userID, page, pageSize)
	if err != nil {
		response.InternalError(c, "获取出行请求列表失败")
		return
	}

	response.SuccessPage(c, list, total, page, pageSize)
}

func (h *RequestHandler) GetMatches(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的请求ID")
		return
	}

	request, err := h.requestService.GetRequest(id)
	if err != nil {
		response.NotFound(c, "出行请求不存在")
		return
	}

	rides, err := h.requestService.GetMatchedRides(id)
	if err != nil {
		response.InternalError(c, "获取匹配行程失败")
		return
	}

	response.Success(c, gin.H{
		"request": request,
		"rides":   rides,
	})
}
