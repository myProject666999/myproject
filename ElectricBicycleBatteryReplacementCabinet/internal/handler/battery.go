package handler

import (
	"battery-cabinet/internal/dao"
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetBatteryList(c *gin.Context) {
	var req model.BatteryListReq
	if err := c.ShouldBindQuery(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	list, total, err := dao.GetBatteryList(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, response.PageResult(list, total, req.Page, req.PageSize))
}

func GetBatteryDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	battery, err := dao.GetBatteryByID(id)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	if battery == nil {
		response.Error(c, "电池不存在")
		return
	}

	history, _, _ := dao.GetBatteryStatusHistory(id, 1, 20)

	response.Success(c, gin.H{
		"battery": battery,
		"history": history,
	})
}

func ReportBatteryStatus(c *gin.Context) {
	var req model.BatteryStatusReportReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	err := dao.ReportBatteryStatus(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	go dao.CheckAndCreateBatteryAlerts()

	response.Success(c, nil)
}

func OfflineBattery(c *gin.Context) {
	var req model.BatteryOfflineReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	err := dao.OfflineBattery(req.BatteryID, req.Reason)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func GetBatteryStats(c *gin.Context) {
	stats, err := dao.GetBatteryStats()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, stats)
}

func GetBatteryStatusHistory(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	list, total, err := dao.GetBatteryStatusHistory(id, page, pageSize)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, response.PageResult(list, total, page, pageSize))
}
