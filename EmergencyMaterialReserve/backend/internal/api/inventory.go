package api

import (
	"strconv"

	"emergency-material/internal/service"
	"emergency-material/pkg/response"

	"github.com/gin-gonic/gin"
)

type InventoryController struct {
}

func NewInventoryController() *InventoryController {
	return &InventoryController{}
}

func (ctrl *InventoryController) GetList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	params := &service.InventoryQueryParams{
		Page:     page,
		PageSize: pageSize,
		BatchNo:  nil,
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

	if batchNo := c.Query("batch_no"); batchNo != "" {
		params.BatchNo = &batchNo
	}

	result, err := service.GetInventoryList(params)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, result)
}

func (ctrl *InventoryController) GetSummary(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	params := &service.InventorySummaryQueryParams{
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

	if isBelowWarningStr := c.Query("is_below_warning"); isBelowWarningStr != "" {
		if isBelowWarning, err := strconv.ParseInt(isBelowWarningStr, 10, 8); err == nil {
			w := int8(isBelowWarning)
			params.IsBelowWarning = &w
		}
	}

	result, err := service.GetInventorySummary(params)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, result)
}

func (ctrl *InventoryController) GetDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	inventory, err := service.GetInventoryDetail(id)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, inventory)
}
