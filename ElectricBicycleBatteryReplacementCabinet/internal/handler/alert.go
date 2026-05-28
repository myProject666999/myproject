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
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	list, total, err := dao.GetAlertList(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, gin.H{
		"list":  list,
		"total": total,
		"page":  req.Page,
		"size":  req.PageSize,
	})
}

func GetAlertStats(c *gin.Context) {
	stats, err := dao.GetAlertStats()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, stats)
}

func GetAlertDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "ID参数错误")
		return
	}

	alert, err := dao.GetAlertByID(id)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, alert)
}

func CreateAlert(c *gin.Context) {
	var req model.AlertCreateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
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
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	err := dao.HandleAlert(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, nil)
}

func CheckAndCreateBatteryAlerts(c *gin.Context) {
	count, err := dao.CheckAndCreateBatteryAlerts()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, count)
}
