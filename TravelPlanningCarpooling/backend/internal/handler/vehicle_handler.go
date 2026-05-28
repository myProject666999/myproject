package handler

import (
	"carpooling/internal/middleware"
	"carpooling/internal/model"
	"carpooling/internal/service"
	"carpooling/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type VehicleHandler struct {
	vehicleService *service.VehicleService
}

func NewVehicleHandler() *VehicleHandler {
	return &VehicleHandler{
		vehicleService: service.NewVehicleService(),
	}
}

func (h *VehicleHandler) Create(c *gin.Context) {
	var req model.CreateVehicleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}
	ownerID := middleware.GetUserID(c)
	if ownerID == 0 {
		response.Unauthorized(c, "未获取到用户信息")
		return
	}
	vehicle, err := h.vehicleService.CreateVehicle(ownerID, &req)
	if err != nil {
		response.InternalError(c, "创建车辆失败")
		return
	}
	response.Success(c, vehicle)
}

func (h *VehicleHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的车辆ID")
		return
	}
	vehicle, err := h.vehicleService.GetVehicle(id)
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}
	response.Success(c, vehicle)
}

func (h *VehicleHandler) List(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未获取到用户信息")
		return
	}
	vehicles, err := h.vehicleService.ListVehicles(userID)
	if err != nil {
		response.InternalError(c, "获取车辆列表失败")
		return
	}
	response.Success(c, vehicles)
}

func (h *VehicleHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的车辆ID")
		return
	}
	var req model.CreateVehicleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未获取到用户信息")
		return
	}
	vehicle, err := h.vehicleService.UpdateVehicle(id, userID, &req)
	if err != nil {
		if err.Error() == "无权操作此车辆" {
			response.Forbidden(c, err.Error())
			return
		}
		response.NotFound(c, err.Error())
		return
	}
	response.Success(c, vehicle)
}

func (h *VehicleHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "无效的车辆ID")
		return
	}
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未获取到用户信息")
		return
	}
	err = h.vehicleService.DeleteVehicle(id, userID)
	if err != nil {
		if err.Error() == "无权操作此车辆" {
			response.Forbidden(c, err.Error())
			return
		}
		response.NotFound(c, err.Error())
		return
	}
	response.Success(c, nil)
}
