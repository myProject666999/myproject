package handler

import (
	"carpooling/internal/middleware"
	"carpooling/internal/model"
	"carpooling/internal/service"
	"carpooling/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type RideHandler struct {
	rideService *service.RideService
}

func NewRideHandler() *RideHandler {
	return &RideHandler{
		rideService: service.NewRideService(),
	}
}

func (h *RideHandler) Create(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未获取到用户信息")
		return
	}

	var req model.CreateRideRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	ride, err := h.rideService.CreateRide(userID, &req)
	if err != nil {
		response.InternalError(c, "创建行程失败")
		return
	}

	response.Success(c, ride)
}

func (h *RideHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的行程ID")
		return
	}

	ride, err := h.rideService.GetRideByID(id)
	if err != nil {
		response.NotFound(c, "行程不存在")
		return
	}

	response.Success(c, ride)
}

func (h *RideHandler) List(c *gin.Context) {
	var query model.RideListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.BadRequest(c, "查询参数错误")
		return
	}

	rides, total, err := h.rideService.ListRides(&query)
	if err != nil {
		response.InternalError(c, "查询行程失败")
		return
	}

	page := query.Page
	if page < 1 {
		page = 1
	}
	pageSize := query.PageSize
	if pageSize < 1 {
		pageSize = 10
	}

	response.SuccessPage(c, rides, total, page, pageSize)
}

func (h *RideHandler) UpdateStatus(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未获取到用户信息")
		return
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的行程ID")
		return
	}

	var body struct {
		Status int `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	if err := h.rideService.UpdateRideStatus(id, userID, body.Status); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (h *RideHandler) GetNearby(c *gin.Context) {
	lng, err := strconv.ParseFloat(c.Query("lng"), 64)
	if err != nil {
		response.BadRequest(c, "无效的经度")
		return
	}
	lat, err := strconv.ParseFloat(c.Query("lat"), 64)
	if err != nil {
		response.BadRequest(c, "无效的纬度")
		return
	}
	radius, _ := strconv.ParseFloat(c.Query("radius"), 64)
	if radius <= 0 {
		radius = 50
	}

	rides, err := h.rideService.GetNearbyRides(lng, lat, radius)
	if err != nil {
		response.InternalError(c, "查询附近行程失败")
		return
	}

	response.Success(c, rides)
}
