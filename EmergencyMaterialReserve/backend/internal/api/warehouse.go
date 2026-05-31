package api

import (
	"strconv"

	"emergency-material/internal/middleware"
	"emergency-material/internal/service"
	"emergency-material/pkg/response"

	"github.com/gin-gonic/gin"
)

type WarehouseController struct {
	materialService *service.MaterialService
}

func NewWarehouseController() *WarehouseController {
	return &WarehouseController{
		materialService: service.NewMaterialService(),
	}
}

func (ctrl *WarehouseController) GetList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := &service.WarehouseQuery{
		Page:     page,
		PageSize: pageSize,
		Code:     c.Query("code"),
		Name:     c.Query("name"),
		City:     c.Query("city"),
	}

	if statusStr := c.Query("status"); statusStr != "" {
		if status, err := strconv.ParseInt(statusStr, 10, 8); err == nil {
			s := int8(status)
			query.Status = &s
		}
	}

	result, err := ctrl.materialService.GetWarehouseList(c.Request.Context(), query)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, result)
}

func (ctrl *WarehouseController) GetDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	warehouse, err := ctrl.materialService.GetWarehouseDetail(c.Request.Context(), id)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, warehouse)
}

func (ctrl *WarehouseController) Create(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	var req service.CreateWarehouseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.OperatorID = userID.(uint64)
	req.OperatorName = username.(string)

	warehouse, err := ctrl.materialService.CreateWarehouse(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, warehouse)
}

func (ctrl *WarehouseController) Update(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	var req service.UpdateWarehouseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.ID = id
	req.OperatorID = userID.(uint64)
	req.OperatorName = username.(string)

	warehouse, err := ctrl.materialService.UpdateWarehouse(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, warehouse)
}

func (ctrl *WarehouseController) Delete(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	err = ctrl.materialService.DeleteWarehouse(c.Request.Context(), id, userID.(uint64), username.(string))
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, nil)
}
