package handler

import (
	"battery-cabinet/internal/dao"
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/response"
	"battery-cabinet/internal/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetCabinetList(c *gin.Context) {
	var req model.CabinetListReq
	if err := c.ShouldBindQuery(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	list, total, err := dao.GetCabinetList(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, response.PageResult(list, total, req.Page, req.PageSize))
}

func GetCabinetDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	vo, err := dao.GetCabinetByID(id)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	if vo == nil {
		response.Error(c, "换电柜不存在")
		return
	}

	slots, _ := dao.GetCabinetSlots(id)
	batteries, _ := dao.GetBatteriesByCabinet(id)

	response.Success(c, gin.H{
		"cabinet":   vo,
		"slots":     slots,
		"batteries": batteries,
	})
}

func GetCabinetMap(c *gin.Context) {
	list, err := dao.GetAllCabinets()
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, list)
}

func CreateCabinet(c *gin.Context) {
	var req model.CabinetCreateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	cabinet := &model.Cabinet{
		CabinetNo:  req.CabinetNo,
		Name:       req.Name,
		Address:    req.Address,
		Longitude:  req.Longitude,
		Latitude:   req.Latitude,
		TotalSlots: req.TotalSlots,
		Status:     model.CabinetStatusNormal,
	}

	err := dao.CreateCabinet(cabinet)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, cabinet)
}

func UpdateCabinet(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req model.CabinetUpdateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Address != "" {
		updates["address"] = req.Address
	}
	if req.Longitude != 0 {
		updates["longitude"] = req.Longitude
	}
	if req.Latitude != 0 {
		updates["latitude"] = req.Latitude
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}

	err := dao.UpdateCabinet(id, updates)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func BatteryExchange(c *gin.Context) {
	var req model.BatteryExchangeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	resp, err := service.BatteryExchange(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, resp)
}

func GetCabinetStats(c *gin.Context) {
	stats, err := dao.GetCabinetStats()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, stats)
}
