package api

import (
	"strconv"
	"time"

	"emergency-material/internal/middleware"
	"emergency-material/internal/service"
	"emergency-material/pkg/response"

	"github.com/gin-gonic/gin"
)

type StockController struct {
}

func NewStockController() *StockController {
	return &StockController{}
}

func (ctrl *StockController) StockIn(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)

	var params service.StockInParams
	if err := c.ShouldBindJSON(&params); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	uid := userID.(uint64)
	params.OperatorID = &uid

	result, err := service.StockIn(&params)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, result)
}

func (ctrl *StockController) StockOut(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)

	var params service.StockOutParams
	if err := c.ShouldBindJSON(&params); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	uid := userID.(uint64)
	params.OperatorID = &uid

	result, err := service.StockOut(&params)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, result)
}

func (ctrl *StockController) GetRecords(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	params := &service.StockRecordQueryParams{
		Page:     page,
		PageSize: pageSize,
	}

	if typeStr := c.Query("type"); typeStr != "" {
		params.Type = &typeStr
	}

	if bizTypeStr := c.Query("biz_type"); bizTypeStr != "" {
		params.BizType = &bizTypeStr
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

	if operatorIDStr := c.Query("operator_id"); operatorIDStr != "" {
		if operatorID, err := strconv.ParseUint(operatorIDStr, 10, 64); err == nil {
			params.OperatorID = &operatorID
		}
	}

	if startTimeStr := c.Query("start_time"); startTimeStr != "" {
		if t, err := time.ParseInLocation("2006-01-02 15:04:05", startTimeStr, time.Local); err == nil {
			params.StartTime = &t
		} else if t, err := time.ParseInLocation("2006-01-02", startTimeStr, time.Local); err == nil {
			params.StartTime = &t
		}
	}

	if endTimeStr := c.Query("end_time"); endTimeStr != "" {
		if t, err := time.ParseInLocation("2006-01-02 15:04:05", endTimeStr, time.Local); err == nil {
			params.EndTime = &t
		} else if t, err := time.ParseInLocation("2006-01-02", endTimeStr, time.Local); err == nil {
			t = t.Add(24 * time.Hour).Add(-time.Second)
			params.EndTime = &t
		}
	}

	result, err := service.GetStockRecordList(params)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, result)
}
