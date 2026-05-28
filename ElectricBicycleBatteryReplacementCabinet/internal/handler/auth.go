package handler

import (
	"battery-cabinet/internal/dao"
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/response"
	"battery-cabinet/internal/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	var req model.LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	resp, err := dao.Login(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, resp)
}

func GetDashboard(c *gin.Context) {
	stats, err := service.GetDashboardStats()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, stats)
}

func GetUserList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.DefaultQuery("keyword", "")

	list, total, err := dao.GetUserList(page, pageSize, keyword)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, response.PageResult(list, total, page, pageSize))
}
