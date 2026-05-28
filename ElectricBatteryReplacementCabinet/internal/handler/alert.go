package handler

import (
	"battery-cabinet/internal/dao"
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetAlertList(c *gin.Context) {
	var req model.AlertListReq
	if err := c.ShouldBindQuery(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	list, total, err := dao.GetAlertList(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, response.PageResult(list, total, req.Page, req.PageSize))
}

func GetAlertDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	vo, err := dao.GetAlertByID(id)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	if vo == nil {
		response.Error(c, "告警不存在")
		return
	}

	response.Success(c, vo)
}

func CreateAlert(c *gin.Context) {
	var req model.AlertCreateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	alert, err := dao.CreateAlert(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, alert)
}

func HandleAlert(c *gin.Context) {
	var req model.AlertHandleReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	err := dao.HandleAlert(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func GetAlertStats(c *gin.Context) {
	stats, err := dao.GetAlertStats()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, stats)
}

func CheckAndCreateBatteryAlerts(c *gin.Context) {
	err := dao.CheckAndCreateBatteryAlerts()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, nil)
}
