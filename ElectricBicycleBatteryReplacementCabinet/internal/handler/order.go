package handler

import (
	"battery-cabinet/internal/dao"
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetOrderList(c *gin.Context) {
	var req model.OrderListReq
	if err := c.ShouldBindQuery(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	list, total, err := dao.GetOrderList(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, response.PageResult(list, total, req.Page, req.PageSize))
}

func GetOrderDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	vo, err := dao.GetOrderByID(id)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	if vo == nil {
		response.Error(c, "订单不存在")
		return
	}

	response.Success(c, vo)
}

func GetOrderStats(c *gin.Context) {
	stats, err := dao.GetOrderStats()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, stats)
}
