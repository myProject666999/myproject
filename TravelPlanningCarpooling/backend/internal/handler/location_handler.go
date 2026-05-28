package handler

import (
	"carpooling/internal/middleware"
	"carpooling/internal/model"
	"carpooling/internal/service"
	"carpooling/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type LocationHandler struct {
	locationService *service.LocationService
}

func NewLocationHandler() *LocationHandler {
	return &LocationHandler{
		locationService: service.NewLocationService(),
	}
}

func (h *LocationHandler) Report(c *gin.Context) {
	var req model.ReportLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未获取到用户信息")
		return
	}

	if err := h.locationService.ReportLocation(userID, &req); err != nil {
		response.InternalError(c, "上报位置失败")
		return
	}

	response.Success(c, nil)
}

func (h *LocationHandler) GetRideLocations(c *gin.Context) {
	rideIDStr := c.Param("ride_id")
	rideID, err := strconv.ParseUint(rideIDStr, 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的行程ID")
		return
	}

	locations, err := h.locationService.GetRideLocations(rideID)
	if err != nil {
		response.InternalError(c, "获取行程位置失败")
		return
	}

	response.Success(c, locations)
}
