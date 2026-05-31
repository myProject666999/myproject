package api

import (
	"strconv"

	"emergency-material/internal/middleware"
	"emergency-material/internal/service"
	"emergency-material/pkg/response"

	"github.com/gin-gonic/gin"
)

type ExpiryController struct {
}

func NewExpiryController() *ExpiryController {
	return &ExpiryController{}
}

func (ctrl *ExpiryController) GetAlerts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	params := &service.ExpiryAlertQueryParams{
		Page:     page,
		PageSize: pageSize,
	}

	if warehouseIDStr := c.Query("warehouse_id"); warehouseIDStr != "" {
		if warehouseID, err := strconv.ParseUint(warehouseIDStr, 10, 64); err == nil {
			params.WarehouseID = &warehouseID
		}
	}

	if materialIDStr := c.Query("material_id"); materialIDStr != "" {
		if materialID, err := strconv.ParseUint(materialIDStr, 10, 64); err == nil {
			params.MaterialID = &materialID
		}
	}

	if alertLevel := c.Query("alert_level"); alertLevel != "" {
		params.AlertLevel = &alertLevel
	}

	if statusStr := c.Query("status"); statusStr != "" {
		if status, err := strconv.ParseInt(statusStr, 10, 8); err == nil {
			s := int8(status)
			params.Status = &s
		}
	}

	result, err := service.GetExpiryAlertList(params)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, result)
}

func (ctrl *ExpiryController) HandleAlert(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	var params service.HandleExpiryAlertParams
	if err := c.ShouldBindJSON(&params); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	params.ID = id
	params.HandledBy = userID.(uint64)

	err = service.HandleExpiryAlert(&params)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (ctrl *ExpiryController) CheckExpiry(c *gin.Context) {
	count, err := service.CheckExpiry()
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"alert_count": count,
	})
}
